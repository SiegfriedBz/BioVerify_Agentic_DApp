# BIOVERIFY

> **Trigger Source:** This graph is triggered by the `api/webhooks/alchemy/picked-reviewers` webhook, , responding to the on-chain `BioVerify_Agent_PickedReviewers` event.

## AI REVIEWERS GRAPH

This LangGraph orchestrates the autonomous peer-review verification pipeline for scientific publications. It implements a multi-layered consensus model combining Human-in-the-Loop (HITL) and AI Forensic Analysis.

### Flow Logic

* **humanReviewsNode** **Gatekeeper.** Waits for the required quorum of cryptographically verified human reviews (EIP-712).
* **llmVerdictNode** **Forensic Auditor.** Analyzes human consensus and technical integrity. Can result in `pass`, `fail`, or `escalate`.
* **seniorReviewNode** **Escalation Path.** If the AI detects ambiguity or high-stakes fraud risks, it pauses for a "Senior Editor" (a human authority selected via reputation score).
* **llmFinalVerdictNode** **Forensic Secretary.** Implements **Human-Finality**. It synthesizes the final verdict, ensuring the Senior Reviewer's decision is enforced while cleaning up reasoning for professional on-chain storage.

---

### Outcomes

#### Scenario: PASS

* **Publisher:** Recovers their initial stake.
* **Honest Reviewers:** Receive rewards (from treasury/slash pool).
* **Dissenters:** Reviewers who voted "Fail" are slashed.

#### Scenario: FAIL

* **Publisher:** Slashed (Stake set to 0).
* **Honest Reviewers:** Receive rewards for catching the failure.
* **Negligent Reviewers:** Reviewers who voted "Pass" are slashed.

---

### Note on Settlement

**PULL-PAYMENT**: To ensure security and minimize gas costs, all rewards and stakes are not sent automatically. Instead, they are moved to a contract mapping for secure user-initiated withdrawal.
