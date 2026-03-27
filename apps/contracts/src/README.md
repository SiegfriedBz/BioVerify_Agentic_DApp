# Protocol Architecture: BioVerifyV3

**BioVerifyV3** is a decentralized, meritocratic peer-review protocol designed for high-throughput research validation. It leverages a "Trustless Hybrid" model, combining **Chainlink VRF V2.5** for unbiased selection, an **Off-chain AI Agent** for orchestration, and a **Staked Human Reviewer Pool** for qualitative validation.

---

## Core Architectural Pillars

* **Trustless Selection (Chainlink VRF V2.5):** Reviewers are selected from the pool via cryptographically secure randomness. The protocol handles native-token funding for the VRF subscription directly from the publisher's submission fee.
* **Meritocratic Hierarchy & Anti-Collusion:** During the selection process, the protocol automatically assigns **Seniority** to the reviewer with the highest reputation score. The selection logic strictly **prevents publishers from self-reviewing**, ensuring a 100% independent evaluation set.
* **O(1) Dynamic Reviewer Pool:** To ensure gas efficiency at scale, the protocol manages an active reviewer pool using a "swap-and-pop" indexed array. Eligibility is determined dynamically based on a member’s **Financial Solvency** (Available Stake vs. Active Review Count).
* **Agentic Lifecycle Management:** An authorized AI Agent acts as the protocol's "Synthesizer," handling early plagiarism detection, recording review submissions, and finalizing the verdict based on synthesized human feedback.

---

## Infrastructure & Deployment

The deployment pipeline is engineered for cross-chain portability, currently supporting **Base Sepolia (L2)** and **Ethereum Sepolia (L1)**.

* **Dynamic Configuration:** `BioVerifyV3Script` utilizes `block.chainid` to inject network-specific parameters (VRF Coordinators, Gas Lanes, Sub IDs) at runtime, keeping core source code immutable.
* **Unified Verification:** Leverages **Etherscan API V2** with a "Universal" key, enabling automated source code verification on both Etherscan and Basescan via a single `foundry.toml` configuration.
* **Strict Decoupling:** Environmental variables and network constants are fully isolated from business logic, allowing deployment to any EVM environment compatible with Chainlink VRF v2.5.

---

## Terminal Outcomes & Economic Settlement

The AI Agent resolves every publication into one of three terminal states. Each state has a distinct impact on the financial and reputational standing of the participants:

| Outcome | Trigger Phase | Publisher Impact | Reviewer Impact |
| :--- | :--- | :--- | :--- |
| **Early Slashed** | **Pre-Review** (Immediate) | **Slashed:** Stake moved to Slash Pool; Reputation penalty. | **None:** No reviewers selected; no rewards distributed. |
| **Published** | **Post-Review** (Success) | **Rewarded:** Stake returned; Reputation boost. | **Split:** Honest get Stake + Reward + Rep; Negligent lose Stake + Rep. |
| **Slashed** | **Post-Review** (Failure) | **Slashed:** Stake moved to Slash Pool; Reputation penalty. | **Split:** Honest get Stake + Reward + Rep; Negligent lose Stake + Rep. |

---

## The Publication Lifecycle

1.  **Submission:** A Publisher stakes ETH and pays a submission fee (covering VRF gas + AI compute) to upload a research CID.
2.  **Initial Validation (Branch A):** The AI Agent performs an automated check. If the paper fails (plagiarism, low quality), it is **Early Slashed** immediately. The process terminates here to save protocol resources and VRF costs.
3.  **Selection (Branch B):** If valid, the AI Agent triggers `pickReviewers()`. Chainlink VRF selects $N$ unique reviewers from the available pool, assigning one Senior Reviewer based on reputation.
4.  **Review Phase:** Human reviewers analyze the CID. The AI Agent records their participation via `recordReview()`.
5.  **Final Settlement:** Based on the synthesized human feedback, the AI Agent triggers one of two final terminal states:
    * **Publish:** The paper is validated. Publisher and honest reviewers are rewarded.
    * **Slash:** The paper is rejected. Publisher is slashed; honest reviewers are still rewarded for their diligence in identifying the failure.
6.  **Sustainability:** Throughout this cycle, the protocol manages a **Reward Pool** and a **Slash Pool**. The AI Agent can reallocate funds from slashes to rewards to ensure long-term protocol solvency.

---

## Technical Optimizations

* **Self-Sustaining VRF Mechanism:** The protocol implements a hybrid VRF v2.5 strategy. While managed via a Subscription ID for lower gas overhead, the contract automatically "top-ups" the subscription balance using the `paidSubmissionFee` via `fundSubscriptionWithNative`. This ensures the protocol is economically autonomous and never runs dry.
* **Subgraph-First Design:** All non-essential state getters were removed in favor of a robust event-emission strategy. The protocol state is intended to be indexed and queried via **The Graph**, minimizing on-chain compute costs and gas consumption.
* **Economic Security:** **100% branch coverage tests** ensure that locked stakes are accurately accounted for across all edge cases, including senior reviewer exits, slashing scenarios, and concurrent review capacity management.
