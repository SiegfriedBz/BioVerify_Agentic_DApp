# Architecture

End-to-end flow diagrams for the BioVerify protocol. Each diagram is cross-referenced against the implementation and package READMEs.

For package-level details see:
- [`apps/contracts`](../apps/contracts/README.md) -- BioVerifyV3 smart contract (staking, VRF, settlement)
- [`apps/fe`](../apps/fe/README.md) -- Next.js frontend, webhook API, Inngest serving
- [`@packages/cqrs`](../packages/cqrs/README.md) -- Event projector, DB queries, on-chain action commands
- [`@packages/agents` (Submission)](../packages/agents/graphs/submission/README.md) -- LangGraph submission agent
- [`@packages/agents` (Review)](../packages/agents/graphs/review/README.md) -- LangGraph review agent
- [`@packages/db`](../packages/db/README.md) -- Drizzle ORM client (Neon Postgres)

---

## Submission & Forensic Pipeline

A scientist submits a publication on-chain. The event flows through the infrastructure pipeline into the Submission Agent, which fetches the abstract from IPFS, runs a neural search for prior art via Exa AI, and produces an LLM verdict. The post-graph logic either slashes the publisher (fail) or triggers Chainlink VRF reviewer selection (pass).

```mermaid
sequenceDiagram
    autonumber
    participant S as Scientist (Next.js / Wagmi)
    participant IPFS as Pinata / IPFS
    participant BC as BioVerifyV3
    participant AN as Alchemy Notify
    participant API as Next.js Webhook API
    participant CQRS as processContractEvent
    participant DB as Neon Postgres
    participant INN as Inngest
    participant LG as Submission Agent (LangGraph)
    participant EXA as Exa AI
    participant VRF as Chainlink VRF

    Note over S,IPFS: Phase 1 -- Frontend Pre-processing
    S->>IPFS: Recursive upload (authors, abstract, assets)
    IPFS-->>S: rootCid (manifest)

    Note over S,BC: Phase 2 -- On-Chain Submission
    S->>BC: submitPublication(cid, paidSubmissionFee) + stake
    BC->>BC: emit SubmitPublication

    Note over BC,DB: Phase 3 -- Event Projection
    BC-->>AN: blockchain event
    AN->>API: POST /api/webhooks/alchemy/all-events
    Note right of API: HMAC signature verified
    API->>CQRS: decodedLog + chainId
    CQRS->>DB: upsert publication (status: SUBMITTED)
    CQRS->>INN: inngest.send(CHAIN_SUBMISSION_RECEIVED)

    Note over INN,EXA: Phase 4 -- Forensic Pipeline (LangGraph)
    INN->>LG: step.run -> startSubmissionAgent(pubId, rootCid)
    activate LG
    LG->>IPFS: fetchIpfsNode -- resolve manifest, fetch abstract
    IPFS-->>LG: abstract text
    LG->>EXA: discoveryNode -- neural search (abstract, numResults: 5)
    EXA-->>LG: scored sources (title, content, url, year, score)
    LG->>LG: llmNode -- structured plagiarism analysis

    Note over LG,BC: Phase 5 -- Post-Graph Settlement (agent-start.ts)
    alt LLM Verdict: FAIL (plagiarism detected)
        LG->>IPFS: pin verdict reason
        IPFS-->>LG: verdictCid
        LG->>BC: earlySlashPublication(pubId, verdictCid)
        BC->>BC: emit NewPublicationStatus (EARLY_SLASHED)
        BC-->>AN: blockchain event
        AN->>API: POST webhook
        API->>CQRS: decodedLog + chainId
        CQRS->>DB: upsert (status: EARLY_SLASHED)

    else LLM Verdict: PASS (original)
        LG->>BC: pickReviewers(pubId)
        BC->>BC: emit Agent_RequestVRF
        BC->>VRF: requestRandomWords()
        activate VRF
        VRF-->>BC: fulfillRandomWords(requestId, randomWords)
        deactivate VRF
        Note over BC: selects N reviewers + senior (by reputation)
        BC->>BC: emit Agent_PickReviewers(pubId, reviewers, senior)
        BC-->>AN: blockchain event
        AN->>API: POST webhook
        API->>CQRS: decodedLog + chainId
        CQRS->>DB: upsert (reviewers, senior, status: IN_REVIEW)
    end
    deactivate LG

    Note over LG,LG: Telegram notifications at agent start and on verdict
```

---

## Peer Review Flow

The review flow is split into two diagrams for readability: (1) how reviews are collected via HITL interrupts, and (2) how consensus is reached and settled on-chain.

### 1. Review Collection (HITL)

The `Agent_PickReviewers` event triggers the Review Agent via Inngest. The agent immediately hits an HITL interrupt and waits for each assigned reviewer to submit an EIP-712-signed verdict. Each review resumes the graph, records the review on-chain, and loops until all assigned reviewers have responded.

```mermaid
sequenceDiagram
    autonumber
    participant REV as Peer Reviewer (Next.js / Wagmi)
    participant SA as Server Action
    participant BC as BioVerifyV3
    participant AN as Alchemy Notify
    participant API as Next.js Webhook API
    participant CQRS as processContractEvent
    participant DB as Neon Postgres
    participant INN as Inngest
    participant LGR as Review Agent (LangGraph)

    Note over CQRS,LGR: Agent Startup (from Agent_PickReviewers event)
    CQRS->>INN: inngest.send(CHAIN_PICKED_REVIEWERS_RECEIVED)
    INN->>LGR: step.run -> startReviewersAgent(pubId, reviewers)
    activate LGR
    LGR->>LGR: humanReviewsNode -- interrupt(), wait for reviews

    Note over REV,LGR: HITL Loop (repeats for each reviewer)

    loop For each assigned reviewer (until quorum = 100%)
        REV->>REV: signTypedData(HumanReview) -- EIP-712
        REV->>SA: sendReviewToAgent(review, signature)
        SA->>SA: verifyReviewEip712(signature)
        SA->>LGR: resumeReviewersAgent(threadId, review)

        LGR->>BC: recordReview(pubId, reviewer)
        BC->>BC: emit Agent_RecordReview
        BC-->>AN: blockchain event
        AN->>API: POST webhook
        API->>CQRS: decodedLog + chainId
        CQRS->>DB: upsert reviewerStatus

        LGR->>LGR: humanReviewsNode -- check quorum, loop or advance
    end

    Note over LGR,LGR: All reviews collected. Proceed to consensus.
    deactivate LGR

    Note over LGR,LGR: Telegram notification on each review received
```

### 2. Consensus & Settlement

Once all reviews are in, the LLM analyzes the collected verdicts. If consensus is clear (all agree), it passes through to settlement. If verdicts conflict, the flow escalates to a senior reviewer (another HITL interrupt), whose decision is enforced by the LLM before settling on-chain.

```mermaid
sequenceDiagram
    autonumber
    participant SR as Senior Reviewer (Next.js / Wagmi)
    participant SA as Server Action
    participant BC as BioVerifyV3
    participant AN as Alchemy Notify
    participant API as Next.js Webhook API
    participant CQRS as processContractEvent
    participant DB as Neon Postgres
    participant LGR as Review Agent (LangGraph)
    participant IPFS as Pinata / IPFS

    Note over LGR,LGR: llmVerdictNode -- analyze collected human reviews

    activate LGR
    LGR->>LGR: llmVerdictNode -- produces pass, fail, or escalate

    alt Verdict: PASS (clear consensus)
        LGR->>LGR: llmFinalVerdictNode -- pass-through (no escalation)
        LGR->>LGR: settlementNode -- partition honest / negligent reviewers
        LGR->>IPFS: pin final verdict
        IPFS-->>LGR: verdictCid
        LGR->>BC: publishPublication(pubId, honest[], negligent[], verdictCid)
        BC->>BC: emit NewPublicationStatus (PUBLISHED)
        BC-->>AN: blockchain event
        AN->>API: POST webhook
        API->>CQRS: decodedLog + chainId
        CQRS->>DB: upsert (status: PUBLISHED)

    else Verdict: FAIL (clear consensus)
        LGR->>LGR: llmFinalVerdictNode -- pass-through (no escalation)
        LGR->>LGR: settlementNode -- partition honest / negligent reviewers
        LGR->>IPFS: pin final verdict
        IPFS-->>LGR: verdictCid
        LGR->>BC: slashPublication(pubId, honest[], negligent[], verdictCid)
        BC->>BC: emit NewPublicationStatus (SLASHED)
        BC-->>AN: blockchain event
        AN->>API: POST webhook
        API->>CQRS: decodedLog + chainId
        CQRS->>DB: upsert (status: SLASHED)

    else Verdict: ESCALATE (conflicting peer verdicts)
        Note over SR,LGR: Senior Reviewer HITL
        LGR->>LGR: seniorReviewNode -- interrupt(), wait for senior

        SR->>SR: signTypedData(HumanReview) -- EIP-712
        SR->>SA: sendSeniorReviewToAgent(review, signature)
        SA->>SA: verifyReviewEip712(signature)
        SA->>LGR: resumeSeniorReviewerAgent(threadId, review)

        LGR->>BC: recordReview(pubId, seniorReviewer)
        BC->>BC: emit Agent_RecordReview
        BC-->>AN: blockchain event
        AN->>API: POST webhook
        API->>CQRS: decodedLog + chainId
        CQRS->>DB: upsert reviewerStatus

        LGR->>LGR: llmFinalVerdictNode -- enforce senior decision, polish reason
        LGR->>LGR: settlementNode -- partition reviewers (senior always honest)
        LGR->>IPFS: pin final verdict
        IPFS-->>LGR: verdictCid

        alt Senior decided: PASS
            LGR->>BC: publishPublication(pubId, honest[], negligent[], verdictCid)
            BC->>BC: emit NewPublicationStatus (PUBLISHED)
        else Senior decided: FAIL
            LGR->>BC: slashPublication(pubId, honest[], negligent[], verdictCid)
            BC->>BC: emit NewPublicationStatus (SLASHED)
        end

        BC-->>AN: blockchain event
        AN->>API: POST webhook
        API->>CQRS: decodedLog + chainId
        CQRS->>DB: upsert final status
    end
    deactivate LGR

    Note over LGR,LGR: Telegram notifications at each stage
```
