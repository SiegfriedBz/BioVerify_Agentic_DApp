![CI-Foundry](https://github.com/SiegfriedBz/BioVerify_Agentic_DApp/actions/workflows/foundry-tests.yml/badge.svg)

# 🔬 BioVerify: The Agentic Protocol for Autonomous Peer Review

## 🛠 Protocol Roadmap & Status

> **Note:** This project is developed in solo and in parallel with a full-time professional software engineering role.


**BioVerify** is a decentralized science (DeSci) protocol designed to solve the global reproducibility crisis. By replacing opaque, slow, and biased traditional peer review with **Stateful AI Agents** and **On-Chain Game Theory**, BioVerify creates an immutable pipeline for scientific integrity. 

The protocol enforces a **Meritocratic Incentive Layer** where Scientists (Publishers) must stake collateral to submit research, risking immediate **Automated Slashing** if my forensic agent detect plagiarism. Conversely, Reviewers participate in a **High-Stakes Consensus Model**, earning rewards for accuracy while facing stake slashing for malicious approvals—ensuring that only verified research reaches the "Published" state.

---

### 🏛 System Architecture: Technical Summary

> BioVerify V3 utilizes a **Getterless Solidity Design Pattern** that treats the blockchain as a lean "truth engine," systematically removing on-chain view functions to drastically reduce gas costs and deployment overhead. To maintain a high-performance UX, the protocol employs a **Custom CQRS Indexing Pipeline** that orchestrates dual-chain Alchemy webhooks to synchronize a serverless Neon PostgreSQL database in real-time. This event-driven architecture, protected by **SQL-level Optimistic Concurrency Control**, provides a low-latency data layer that enables my LangGraph AI agents to ingest cross-chain protocol state without RPC bottlenecks.

---


### ✅ Phase 1: Autonomous Foundation & Submission
**Timeline:** Jan 27 — Feb 6, 2026

* **Protocol Engine:** Initial staking logic and submission flow.
* **Agentic Forensic Layer:** LangGraph.js orchestration with Tavily search for literature overlap.
* **Event-Driven Architecture:** Secure Alchemy Notify pipeline for real-time protocol triggers.

---

### ✅ Phase 2: Monorepo Migration, Getter-less BioVerify Contract & CQRS Indexing
**Timeline:** Feb 7 — March 27, 2026

* **Pnpm Monorepo Infrastructure:**
    * **Strict Boundaries:** Modularized the stack into `@packages/agents` (LangGraph), `@packages/db` (Drizzle/Neon), `@packages/schema` (Zod validation), `@packages/utils`, `@packages/utils-server`, and `@packages/cqrs`.
    * **Workspace Apps:** Clean separation between `apps/fe` (Next.js 16) and `apps/contracts` (Foundry).
* **Solidity Getterless Design Pattern (V3):**
    * **Lean EVM:** Systematically removed nearly all on-chain `view` getters, treating the blockchain as a lean "truth engine" to drastically reduce gas costs.
    * **Event-Driven State:** Leveraged emitted events as the primary data source to feed the Neon DB, enabling high-performance queries for the frontend without RPC bottlenecking.
    * **Economics Refinement:** Optimized the **staking and reward logic** to ensure precise distribution.
    * **100% Coverage:** Verified 100% line, function, and branch coverage across the Foundry test suite.
* **Custom CQRS Indexing Pipeline:**
    * **Dual-Chain Webhook Orchestration:** Configured independent **Alchemy Notify** webhooks for Ethereum and Base Sepolia.
    * **The Gateway Service:** A unified Next.js API route that verifies HMAC signatures, normalizes cross-chain payloads, and upserts data into **Neon PostgreSQL**.
    * **Optimistic Concurrency Control (OCC):** Implemented SQL version checks using `lastBlockNumber` and `lastLogIndex` to prevent out-of-order webhook events from overwriting fresh data.
* **Meritocratic Review Orchestration (HITL):**
    * **Cryptographic Integrity:** Implemented **EIP-712 typed data signing** for gasless reviewer verdicts.
    * **AI-Driven Consensus:** A LangGraph engine that evaluates peer variance and triggers **Senior Reviewer** escalation (Golden Truth) upon conflict.
* **Frontend Architecture & React Streaming:**
    * **Advanced Streaming:** Utilized Next.js App Router granular **Suspense** to allow UI shells to render while IPFS content streams in.
    * **TanStack Query / Optimistic UI:** Implemented structured query keys and optimistic updates for interactions like `usePayReviewerStake`, bridging the gap between blockchain finality and UX responsiveness.
    
#### 📊 Submission & Forensic Pipeline
```mermaid
sequenceDiagram
    autonumber
    participant S as Scientist (Next.js/Wagmi)
    participant IPFS as Pinata/IPFS
    participant BC as BioVerify Contract
    participant VRF as Chainlink VRF
    participant AN as Alchemy Notify (Dual Chain)
    participant API as Vercel API (Webhook)
    participant CQRS as CQRS Event Handler
    participant DB as Neon DB (PostgreSQL)
    participant LG as LangGraph Submission Agent
    participant TAV as Tavily Search

    Note over S, IPFS: Frontend: Pre-processing
    S->>IPFS: Recursive upload (authors, abstract, assets)
    IPFS-->>S: Return Root CID (Manifest)

    Note over S, BC: Protocol Entry
    S->>BC: submitPublication(rootCID, stake + fee)
    BC->>BC: emit SubmitPublication
    BC-->>AN: [Blockchain Event]
    AN->>API: POST /api/webhooks/alchemy/all-events
    
    Note right of API: HMAC Signature Verified
    
    API->>CQRS: processContractEvent(chainid, pubId, rootCid, blockNumber)
    
    activate CQRS
    CQRS->>DB: Upsert Publication (/sync)
    CQRS->>LG: startSubmissionAgent(pubId, rootCid)
    deactivate CQRS
    
    activate LG
    LG->>IPFS: Fetch Abstract from Root CID
    IPFS-->>LG: Abstract Data
    LG->>TAV: Plagiarism Search (Abstract)
    TAV-->>LG: LLM Similarity Score & Context

    Note over LG, BC: Plagiarism Check - FAIL
    alt Similarity > Threshold (FAIL)
        LG->>BC: earlySlashPublication(pubId)
        BC->>BC: emit NewPublicationStatus (EARLY_SLASHED)
        BC-->>AN: [Blockchain Event]
        AN->>API: POST /api/webhooks/alchemy/all-events
        API->>CQRS: processContractEvent(blockNumber, ...rest)
        CQRS->>DB: /sync

    Note over LG, BC: Plagiarism Check - PASS
    else Similarity < Threshold (PASS)
        LG->>BC: pickReviewers(pubId)
        BC->>BC: emit Agent_RequestVRF
        BC-->>AN: [Blockchain Event]
        AN->>API: POST /api/webhooks/alchemy/all-events
        API->>CQRS: processContractEvent(blockNumber, ...rest)
        CQRS->>DB: /sync

        BC->>VRF: requestRandomWords()
        activate VRF
        VRF-->>BC: fulfillRandomWords(requestId, randoms)
        deactivate VRF
        BC->>BC: emit Agent_PickReviewers(pubId, reviewers)
        BC-->>AN: [Blockchain Event]
        AN->>API: POST /api/webhooks/alchemy/all-events
        API->>CQRS: processContractEvent(blockNumber, ...rest)
        CQRS->>DB: /sync
    end
    deactivate LG

    Note over BC, LG: Telemetry logs pushed to Telegram
```

#### 📊 Peer Review & Consensus Flow (HITL)
```mermaid
sequenceDiagram
    autonumber
    participant REV_A as Reviewer OxA (Next.js/Wagmi)
    participant REV_B as Reviewer OxB (Next.js/Wagmi)
    participant SENIOR_REV as Senior Reviewer OxX (Next.js/Wagmi)
    participant BC as BioVerify Contract
    participant VRF as Chainlink VRF
    participant AN as Alchemy Notify (Dual Chain)
    participant API as Vercel API (Webhook)
    participant CQRS as CQRS Event Handler
    participant DB as Neon DB (PostgreSQL)
    participant LG as LangGraph Submission Agent
    participant LGR as LangGraph Review Agent (HITL)

     Note over LG, BC: Plagiarism Check - PASS
     LG->>BC: pickReviewers(pubId)
        BC->>BC: emit Agent_RequestVRF
        BC-->>AN: [Blockchain Event]
        AN->>API: POST /api/webhooks/alchemy/all-events
        API->>CQRS: processContractEvent(blockNumber, ...rest)
        CQRS->>DB: /sync

        BC->>VRF: requestRandomWords()
        activate VRF
        VRF-->>BC: fulfillRandomWords(requestId, randoms)
        deactivate VRF
        BC->>BC: emit Agent_PickReviewers(pubId, reviewers)
        BC-->>AN: [Blockchain Event]
        AN->>API: POST /api/webhooks/alchemy/all-events
        API->>CQRS: processContractEvent(blockNumber, ...rest)
        activate CQRS
          CQRS->>DB: /sync
          CQRS->>LGR: startReviewersAgent(pubId, reviewers)
       deactivate CQRS

    Note over REV_A, LGR: HITL - EIP712
    Note right of LGR: EIP712 Signature Verified
    REV_A->>LGR: resumeReviewersAgent(threadId, review, signature)

    Note over LGR, BC: Protocol Entry
    LGR-->BC: recordReview(pubId, reviewer)
    BC->>BC: emit Agent_RecordReview
    BC-->>AN: [Blockchain Event]

    AN->>API: POST /api/webhooks/alchemy/all-events
    API->>CQRS: processContractEvent(blockNumber, ...rest)
    activate CQRS
       CQRS->>DB: /sync
    deactivate CQRS

    Note over REV_B, LGR: HITL - EIP712
    Note right of LGR: EIP712 Signature Verified
    REV_B->>LGR: resumeReviewersAgent(threadId, review, signature)

    Note over LGR, BC: Protocol Entry
    LGR-->BC: recordReview(pubId, reviewer)
    BC->>BC: emit Agent_RecordReview
    BC-->>AN: [Blockchain Event]

    AN->>API: POST /api/webhooks/alchemy/all-events
    API->>CQRS: processContractEvent(blockNumber, ...rest)
    activate CQRS
       CQRS->>DB: /sync
    deactivate CQRS
    
    activate LGR
    LGR->>LGR: Reviewers' Verdicts LLM Consensus Check

    Note over LGR, BC: Clear Consensus on Verdicts - PASS
    alt Clear Consensus on Verdicts - PASS
        LGR->>BC: publishPublication(pubId)
        BC->>BC: emit NewPublicationStatus (PUBLISHED)
        BC-->>AN: [Blockchain Event]
        AN->>API: POST /api/webhooks/alchemy/all-events
        API->>CQRS: processContractEvent(blockNumber, ...rest)
        CQRS->>DB: /sync

    Note over LGR, BC: Clear Consensus on Verdicts - FAIL
    else Clear Consensus on Verdicts - FAIL
        LGR->>BC: slashPublication(pubId)
        BC->>BC: emit NewPublicationStatus (SLASHED)
        BC-->>AN: [Blockchain Event]
        AN->>API: POST /api/webhooks/alchemy/all-events
        API->>CQRS: processContractEvent(blockNumber, ...rest)
        CQRS->>DB: /sync

    Note over LGR, BC: UN-clear Consensus - Senior Reviewer HITL
    else UN-clear Consensus on Verdicts - Senior Reviewer HITL
       Note over SENIOR_REV, LGR: HITL - EIP712
       Note right of LGR: EIP712 Signature Verified
       SENIOR_REV->>LGR: resumeSeniorReviewerAgent(threadId, review, signature)
   
       Note over LGR, BC: Protocol Entry
       LGR-->BC: recordReview(pubId, reviewer)
       BC->>BC: emit Agent_RecordReview
       BC-->>AN: [Blockchain Event]
   
       AN->>API: POST /api/webhooks/alchemy/all-events
       API->>CQRS: processContractEvent(blockNumber, ...rest)
       activate CQRS
          CQRS->>DB: /sync
       deactivate CQRS
       
       activate LGR
       LGR->>LGR: LLM Alignment on Senior Reviewer Verdict 
       end
    deactivate LGR

    Note over BC, LG: Telemetry logs pushed to Telegram

```

---

### 🏗 Phase 3: Durable Workflows & Advanced Forensics
**Timeline:** March 28, 2026 — Present

* **Durable Agent Orchestration (Inngest)**
    * [ ] **Asynchronous Event Handlers:** Migrate LangGraph agents to background **Inngest** functions.
    * [ ] **Persistence & Retries:** Implement durable execution steps to ensure LangGraph agents resume automatically after timeouts or cold starts.
    * [ ] **Webhook Dependency Injection:** Refactor the `@packages/cqrs` dispatcher to trigger Inngest workflows directly from Alchemy webhooks.

* **Neural Research Discovery (Exa AI)**
    * [ ] **Semantic Plagiarism Detection:** Replace Tavily keyword-based search with **Exa AI**'s neural engine to identify similarities based on scientific meaning.
    * [ ] **Full-Text Retrieval:** Integrate Exa’s content extraction to provide the LLM verdict node with complete source material for forensic analysis.

* **Protocol Settlement UI**
    * [ ] **Reward & Stake Claims:** Build the `claim` interface for withdrawing available rewards and unlocked stakes.
    * [ ] **Real-time Audit Timeline:** Create a UI component to stream live reasoning steps and consensus status from the background workers.

* **UI Polish & Layout**
    * [ ] **Container Query Refinement:** Fine-tune the `@container`-based responsive layout within the `SidebarProvider` shell.
---

### 🌍 Deployment Registry

| Network | Contract Address |
| :--- | :--- |
| **Base Sepolia** | `0xa5fd28966be524490d855fbe6e3c830357197251` |
| **Ethereum Sepolia** | `0x1dcb58429f02c627dc726c623a4a9e785ecac3c7` |
