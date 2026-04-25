# BioVerifyV3

Decentralized, meritocratic peer-review protocol for high-throughput research validation. Leverages a "Trustless Hybrid" model combining **Chainlink VRF V2.5** for unbiased reviewer selection, an **off-chain AI Agent** for orchestration, and a **staked human reviewer pool** for qualitative validation.

## Getter-Less Design

The contract intentionally exposes almost no view functions. Instead, every state mutation emits granular events. These events are picked up off-chain by **Alchemy Notify** webhooks and projected into a **Neon Postgres** database with Optimistic Concurrency Control. All frontend queries are served from that projection -- not from on-chain reads. This eliminates non-essential `view` functions, minimizes on-chain compute costs, and keeps gas consumption low. See [`@packages/cqrs`](../../packages/cqrs/README.md) for the full event sync and query layer.

## Core Architectural Pillars

- **Trustless Selection (Chainlink VRF V2.5):** Reviewers are selected from the pool via cryptographically secure randomness. The protocol funds the VRF subscription directly from the publisher's submission fee.
- **Meritocratic Hierarchy & Anti-Collusion:** During selection, the protocol automatically assigns seniority to the reviewer with the highest reputation score. The selection logic strictly prevents publishers from self-reviewing, ensuring a 100% independent evaluation set.
- **O(1) Dynamic Reviewer Pool:** The protocol manages an active reviewer pool using a "swap-and-pop" indexed array. Eligibility is determined dynamically based on a member's financial solvency (`availableStake >= I_REVIEWER_STAKE`).
- **Agentic Lifecycle Management:** An authorized AI Agent acts as the protocol's orchestrator, handling early plagiarism detection, recording review submissions, and finalizing the verdict based on synthesized human feedback.

## Architecture

`BioVerifyV3` inherits from Chainlink's `VRFConsumerBaseV2Plus` and uses OpenZeppelin's `ReentrancyGuard`. Access control is lean by design: a single immutable `I_AI_AGENT_ADDRESS` gates all settlement functions via the `onlyAgent` modifier.

## Key Types

### `PublicationStatus` (enum)

| Value | Meaning |
|-------|---------|
| `SUBMITTED` | Submitted and staked, awaiting AI pre-validation |
| `EARLY_SLASHED` | Slashed by the submission agent before peer review |
| `IN_REVIEW` | VRF selected reviewers, peer review in progress |
| `SLASHED` | Slashed after peer review (fraud detected) |
| `PUBLISHED` | Passed peer review, published on-chain |

### `Publication` (struct)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `uint256` | Auto-incremented publication ID |
| `lockedStake` | `uint256` | Total stake locked on this publication |
| `paidSubmissionFee` | `uint256` | Fee paid by publisher (funds VRF) |
| `publisher` | `address` | Address of the submitting scientist |
| `reviewers` | `address[]` | VRF-selected peer reviewers |
| `seniorReviewer` | `address` | Highest-reputation reviewer (tie: first picked) |
| `cid` | `string` | IPFS CID of the publication manifest |
| `verdictCid` | `string` | IPFS CID of the final verdict |
| `status` | `PublicationStatus` | Current lifecycle status |

### `Member` (struct)

| Field | Type | Description |
|-------|------|-------------|
| `mbAddress` | `address` | Member wallet address |
| `availableStake` | `uint256` | Withdrawable balance |
| `lockedStake` | `uint256` | Stake locked across active reviews |
| `submittedPublicationsIds` | `uint256[]` | Publications submitted by this member |
| `reputation` | `uint256` | Reputation score (affects senior reviewer selection) |

### `BioVerifyConfig` (struct)

Constructor parameters: `reputationBoost`, `aiAgent`, `treasury`, `pubMinFee`, `pubMinStake`, `revMinStake`, `revReward`, plus Chainlink VRF config (`vrfCoordinator`, `vrfGasLimit`, `vrfSubId`, `vrfKeyHash`, `vrfConfirmations`, `vrfNumWords`).

## Functions

### User-Facing

| Function | Description |
|----------|-------------|
| `submitPublication(cid)` | Submit a publication with IPFS CID. Requires `msg.value >= I_PUBLISHER_STAKE + I_PUBLISHER_MIN_FEE`. The stake is fixed; the submission fee is derived as `msg.value - I_PUBLISHER_STAKE` and stored as `paidSubmissionFee` (funds VRF). Emits `SubmitPublication`. |
| `payReviewerStake()` | Stake exactly `I_REVIEWER_STAKE` to join the reviewer pool. Registers the member if new. |
| `claim(amount)` | Withdraw `amount` from `availableStake`. Non-reentrant. |
| `receive()` | Accept ETH donations into `rewardPool`. |

### Agent-Only (`onlyAgent` modifier)

| Function | Description |
|----------|-------------|
| `pickReviewers(pubId)` | Triggers Chainlink VRF to randomly select peer reviewers. Requires sufficient reviewer pool and reward pool liquidity. |
| `recordReview(pubId, reviewer)` | Marks a reviewer as having submitted their review for a publication. Idempotent. |
| `earlySlashPublication(pubId, verdictCid)` | Slash publisher before peer review (plagiarism detected by submission agent). |
| `publishPublication(pubId, honest, negligent, verdictCid)` | Settle a publication as PUBLISHED. Rewards honest reviewers, slashes negligent ones. |
| `slashPublication(pubId, honest, negligent, verdictCid)` | Settle a publication as SLASHED. Slashes publisher and negligent reviewers. |
| `transferSlashPoolToTreasury(amount)` | Send funds from `slashPool` to treasury. Non-reentrant. |
| `moveSlashPoolToRewardPool(amount)` | Move funds from `slashPool` to `rewardPool`. |

### VRF Callback (internal)

| Function | Description |
|----------|-------------|
| `fulfillRandomWords(requestId, randomWords)` | Called by Chainlink VRF. Selects unique reviewers from the pool (excluding the publisher), picks the senior reviewer by highest reputation, locks reviewer stakes, and emits `Agent_PickReviewers`. |

## Publication Lifecycle

1. **Submission:** A publisher stakes ETH and pays a submission fee (covering VRF gas + AI compute) to upload a research CID.
2. **Initial Validation:** The AI Agent performs an automated plagiarism check. If the paper fails, it is **Early Slashed** immediately. The process terminates here to save protocol resources and VRF costs.
3. **Selection:** If valid, the AI Agent triggers `pickReviewers()`. Chainlink VRF selects N unique reviewers from the available pool, assigning one Senior Reviewer based on reputation.
4. **Review Phase:** Human reviewers analyze the publication. The AI Agent records their participation via `recordReview()`.
5. **Final Settlement:** Based on the synthesized human feedback, the AI Agent triggers one of two terminal states:
    - **Publish:** The paper is validated. Publisher and honest reviewers are rewarded.
    - **Slash:** The paper is rejected. Publisher is slashed; honest reviewers are still rewarded for their diligence.
6. **Sustainability:** Throughout this cycle, the protocol manages a **Reward Pool** and a **Slash Pool**. The AI Agent can reallocate funds from slashes to rewards to ensure long-term protocol solvency.

## Terminal Outcomes

| Outcome | Trigger Phase | Publisher Impact | Reviewer Impact |
|:--------|:--------------|:-----------------|:----------------|
| **Early Slashed** | Pre-Review (Immediate) | Slashed: stake moved to slash pool; reputation penalty. | None: no reviewers selected; no rewards distributed. |
| **Published** | Post-Review (Success) | Rewarded: stake returned; reputation boost. | Split: honest get stake + reward + rep; negligent lose stake + rep. |
| **Slashed** | Post-Review (Failure) | Slashed: stake moved to slash pool; reputation penalty. | Split: honest get stake + reward + rep; negligent lose stake + rep. |

## Staking & Reward Mechanics

### Publisher

- Pays `I_PUBLISHER_STAKE` + `paidSubmissionFee` on submission.
- Stake is locked on the publication.
- **Pass**: stake unlocked, reputation += `I_REPUTATION_BOOST`.
- **Slash** (early or post-review): locked stake moves to `slashPool`, reputation -= `I_REPUTATION_BOOST` (floored at 0).

### Reviewer

- Joins the pool by paying exactly `I_REVIEWER_STAKE`.
- When selected by VRF, `I_REVIEWER_STAKE` is locked per publication. `rewardPool` is charged `I_VRF_NUM_WORDS * I_REVIEWER_REWARD` at fulfillment.
- **Honest**: stake unlocked + `I_REVIEWER_REWARD` credited to `availableStake`, reputation += `I_REPUTATION_BOOST`.
- **Negligent**: locked stake moves to `slashPool`, `I_REVIEWER_REWARD` returned to `rewardPool`, reputation -= `I_REPUTATION_BOOST`.

### Pools

- **`rewardPool`**: Funded by `receive()` / constructor. At VRF fulfillment, `I_VRF_NUM_WORDS * I_REVIEWER_REWARD` is pre-provisioned (debited). When a reviewer is found negligent, their unused `I_REVIEWER_REWARD` is returned to the pool.
- **`slashPool`**: Receives slashed stakes. Can be transferred to treasury or moved back to `rewardPool` by the agent.

## Events

| Family | Events |
|--------|--------|
| Protocol Pools | `RewardPool`, `SlashPool` |
| Members | `RewardMember`, `SlashMember`, `IsAvailableReviewer`, `MemberReputation`, `MemberAvailableStake`, `MemberLockedStake`, `MemberLockedStakeOnPubId`, `Claim` |
| Publications | `SubmitPublication`, `LockedStakeOnPubId`, `NewPublicationStatus` |
| Agent Actions | `Agent_RequestVRF`, `Agent_PickReviewers`, `Agent_RecordReview`, `Agent_FinalizePublication`, `Agent_TransferSlashPoolToTreasury`, `Agent_MoveSlashPoolToRewardPool` |

## Technical Optimizations

- **Self-Sustaining VRF:** The protocol implements a hybrid VRF v2.5 strategy. While managed via a Subscription ID for lower gas overhead, the contract automatically tops up the subscription balance using `paidSubmissionFee` via `fundSubscriptionWithNative`. This ensures the protocol is economically autonomous.
- **Getter-Less Event Projection:** All non-essential state getters were removed in favor of a comprehensive event-emission strategy. Every state mutation emits indexed events that are captured off-chain by Alchemy Notify, projected into a Neon Postgres database with Optimistic Concurrency Control (`blockNumber` + `logIndex` ordering), and served as the read model for all frontend queries. See [`@packages/cqrs`](../../packages/cqrs/README.md).
- **Economic Security:** Branch coverage tests ensure that locked stakes are accurately accounted for across all edge cases, including senior reviewer exits, slashing scenarios, and concurrent review capacity management.

## Infrastructure & Deployment

The deployment pipeline supports cross-chain portability, currently targeting **Base Sepolia (L2)** and **Ethereum Sepolia (L1)**.

- **Dynamic Configuration:** The deploy script utilizes `block.chainid` to inject network-specific parameters (VRF Coordinators, Gas Lanes, Sub IDs) at runtime, keeping core source code immutable.
- **Unified Verification:** Leverages Etherscan API V2 with a universal key, enabling automated source code verification on both Etherscan and Basescan via a single `foundry.toml` configuration.
- **Strict Decoupling:** Environmental variables and network constants are fully isolated from business logic, allowing deployment to any EVM environment compatible with Chainlink VRF v2.5.

## Development

Built with [Foundry](https://book.getfoundry.sh/).

```shell
forge build       # compile
forge test        # run tests
forge fmt         # format
forge snapshot    # gas snapshots
```
