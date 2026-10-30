# Review Agent

LangGraph agent that orchestrates the peer-review verification pipeline for scientific publications. Combines Human-in-the-Loop (HITL) review collection, a Gemini verdict over the peer reviews, and an optional senior reviewer escalation path.

## Trigger Chain

This agent is only started if the [Submission Agent](../submission/README.md) **passed** the plagiarism check and called `pickReviewersCommand()` on-chain. That function triggers a Chainlink VRF request. When the VRF callback `fulfillRandomWords()` executes, it selects N reviewers plus a senior reviewer (highest reputation), then emits `Agent_PickReviewers`. That event flows through the infrastructure pipeline to start this agent:

```mermaid
sequenceDiagram
    participant SubAgent as Submission Agent
    participant BioVerifyV3
    participant ChainlinkVRF as Chainlink VRF
    participant AlchemyNotify
    participant NextAPI as Next.js Webhook API
    participant CQRS as processContractEvent
    participant DB as Postgres (Neon)
    participant Inngest
    participant RevAgent as Review Agent

    SubAgent->>BioVerifyV3: pickReviewers(pubId)
    BioVerifyV3->>ChainlinkVRF: requestRandomWords()
    ChainlinkVRF->>BioVerifyV3: fulfillRandomWords() callback
    Note over BioVerifyV3: selects N reviewers + senior (by reputation)
    BioVerifyV3-->>AlchemyNotify: emits Agent_PickReviewers event
    AlchemyNotify->>NextAPI: POST /api/webhooks/alchemy/all-events
    NextAPI->>CQRS: decode log + processContractEvent()
    CQRS->>DB: upsert publication (reviewers, senior, status: IN_REVIEW)
    CQRS->>Inngest: inngest.send(CHAIN_PICKED_REVIEWERS_RECEIVED)
    Inngest->>RevAgent: step.run -> startReviewersAgent()
    Note over RevAgent: graph starts, immediately hits HITL interrupt
    Note over RevAgent: waits for reviewers to submit EIP-712 signed reviews
```

1. **Alchemy Notify** watches the `BioVerifyV3` contract and POSTs raw logs to the Next.js webhook at `apps/fe/app/api/webhooks/alchemy/all-events/route.ts`.
2. The webhook decodes each log with `viem` and calls `processContractEvent()` from `@packages/cqrs`, which upserts the publication (with reviewer addresses and senior reviewer) into Postgres and emits an Inngest event.
3. The Inngest function `review-publication` picks up `CHAIN_PICKED_REVIEWERS_RECEIVED` and runs `startReviewersAgent()` inside a `step.run`. The graph stops at its first `interrupt()` and its state waits in the Postgres checkpointer; every later step, settlement included, runs in the Next.js server action that resumes it, outside Inngest and with no retry.

## Graph

```mermaid
    graph TD
    START([Start]) --> humanReviewsNode

    humanReviewsNode["HITL - Human reviews - Collect peer reviewers verdicts"]
    quorumCheck{Quorum met?}

    humanReviewsNode --> quorumCheck
    quorumCheck -->|No| waitNode(["↻ Awaiting more reviews"])
    waitNode --> humanReviewsNode
    quorumCheck -->|Yes| llmVerdictNode

    llmVerdictNode["LLM verdict - Evaluate and decide"]
    llmVerdictNode -->|Pass or fail| llmFinalVerdictNode
    llmVerdictNode -->|Escalate| seniorReviewNode

    seniorReviewNode["Escalation (LLM returned escalate) - HITL - Senior reviewer verdict"]
    seniorReviewNode --> llmFinalVerdictNode

    llmFinalVerdictNode["LLM final verdict - Consolidated outcome"]
    llmFinalVerdictNode --> settlementNode

    settlementNode["Settlement"]
    settlementNode --> END([End])
```

### Nodes

| # | Node | What it does |
|---|------|-------------|
| 1 | `humanReviewsNode` | **HITL interrupt.** Waits for each assigned peer reviewer to submit an EIP-712-signed review. Self-loops until the full quorum is met. Each incoming review triggers `recordReviewCommand` (on-chain `recordReview`). |
| 2 | `llmVerdictNode` | **Forensic Auditor.** Gemini (`gemini-2.5-flash-lite`) with structured output analyzes the collected human reviews. Produces `pass`, `fail`, or `escalate`. Its prompt asks for `escalate` on a split decision, but nothing in code forces it; a `pass` or `fail` stands without a human, and the reviewer who disagreed with it is slashed. |
| 3 | `seniorReviewNode` | **Escalation path** (conditional -- only entered when `llmVerdictNode` returns `escalate`). Another HITL interrupt that waits for the senior reviewer's EIP-712-signed decision. |
| 4 | `llmFinalVerdictNode` | **Forensic Secretary.** If escalated, the code sets the decision to the senior reviewer's; the LLM only rewrites the reasoning for on-chain storage. If not escalated, passes through the existing verdict. |
| 5 | `settlementNode` | **On-chain settlement.** Partitions reviewers into honest/negligent based on alignment with the final decision; the senior reviewer is always counted honest. Calls `publishPublicationCommand` (on-chain `publishPublication`) (pass) or `slashPublicationCommand` (on-chain `slashPublication`) (fail). |

### State

| Field | Type | Default |
|-------|------|---------|
| `network` | `NetworkT` | -- |
| `publicationId` | `string` | -- |
| `rootCid` | `string` | -- |
| `humanReviews` | `HumanReview[]` | `[]` |
| `llmVerdict` | `{ decision, reason }` | `{ decision: "pending", reason: "" }` |
| `seniorReview` | `HumanReview` | `{ address: "" }` |

## Resume Paths (HITL)

The graph uses LangGraph's `interrupt()` / `Command({ resume })` mechanism. Two entry points wake it up from outside:

| Function | When it is called |
|----------|-------------------|
| `resumeReviewersAgent` | A peer reviewer submits their review. Verifies the EIP-712 signature, confirms the signer is an assigned reviewer, then resumes the graph with the review payload. |
| `resumeSeniorReviewerAgent` | The senior reviewer submits their escalation decision. Verifies the EIP-712 signature, confirms the signer matches the assigned senior reviewer and the verdict was escalated, then resumes the graph. |

## Outcomes

#### Scenario: PASS

* **Publisher:** Recovers their initial stake.
* **Honest Reviewers:** Stake unlocked plus a reward from the reward pool.
* **Dissenters:** Reviewers who voted "Fail" are slashed.

#### Scenario: FAIL

* **Publisher:** Slashed (stake moved to the slash pool).
* **Honest Reviewers:** Receive rewards for catching the failure.
* **Negligent Reviewers:** Reviewers who voted "Pass" are slashed.

---

### Note on Settlement

**PULL-PAYMENT**: To ensure security and minimize gas costs, all rewards and stakes are not sent automatically. Instead, they are moved to a contract mapping for secure user-initiated withdrawal.
