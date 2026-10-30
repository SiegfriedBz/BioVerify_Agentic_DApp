# BioVerifyV3

Peer-review contract for BioVerify, deployed on testnets. It combines **Chainlink VRF V2.5** for the reviewer draw, an **off-chain AI agent** that drives every lifecycle transition, and a **staked human reviewer pool** for the reviews. The draw is verifiable on-chain; settlement trusts the agent key (see [Trust assumptions](#trust-assumptions)).

## Few Getters

The contract has no getters for publications or members. Every state change emits events instead; **Alchemy Notify** webhooks pick them up and project them into a **Neon Postgres** database with optimistic concurrency, and the frontend reads that projection, not the chain. The pools (`rewardPool`, `slashPool`), the configuration (`I_*`) and the owner stay public. This keeps the contract smaller; each write emits several events, which costs a little more gas. See [`@packages/cqrs`](../../packages/cqrs/README.md) for the full event sync and query layer.

## Core Architectural Pillars

- **Verifiable Selection (Chainlink VRF V2.5):** Reviewers are drawn from the pool with VRF randomness; Chainlink's coordinator verifies the randomness proof before it calls the contract back. The publisher's submission fee funds the VRF subscription.
- **Senior Reviewer by Reputation:** The drawn reviewer with the highest reputation becomes the senior reviewer. The draw skips the publisher, so an author cannot review their own paper.
- **O(1) Dynamic Reviewer Pool:** The protocol manages an active reviewer pool using a "swap-and-pop" indexed array. Eligibility is determined dynamically based on a member's financial solvency (`availableStake >= I_REVIEWER_STAKE`).
- **Agent-Driven Lifecycle:** One agent address early-slashes, picks reviewers, records reviews and settles. The verdict it settles comes from off-chain: Gemini's reading of the peer reviews, or the senior reviewer's decision after escalation. The contract checks the reviewer lists, not the verdict.

## Architecture

`BioVerifyV3` inherits from Chainlink's `VRFConsumerBaseV2Plus` and uses OpenZeppelin's `ReentrancyGuard`. Access control is lean by design: a single immutable `I_AI_AGENT_ADDRESS` gates all settlement functions via the `onlyAgent` modifier.

## Trust Assumptions

- The agent key settles every publication. The contract limits *whom* a settlement can touch (only the drawn reviewers, each with stake locked on that publication), not the verdict.
- On both deployments one wallet is the agent, the treasury and the owner, and the owner can change the VRF coordinator.
- Reviews are signed with EIP-712 and verified off-chain; the contract stores a flag per review, not the signature.

See [Known bugs and trust assumptions](../../README.md#known-bugs-and-trust-assumptions) in the root README for the full list.

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
5. **Final Settlement:** With the final verdict (Gemini's reading of the peer reviews, or the senior reviewer's decision after escalation), the AI Agent triggers one of two terminal states:
    - **Publish:** The paper is validated. Publisher and honest reviewers are rewarded.
    - **Slash:** The paper is rejected. Publisher is slashed; honest reviewers are still rewarded for their diligence.
6. **Sustainability:** Throughout this cycle, the protocol manages a **Reward Pool** and a **Slash Pool**. The AI Agent can move funds from the slash pool to the reward pool to keep rewards funded.

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

- **VRF Funded by Submissions:** The contract uses a VRF v2.5 subscription and tops it up in `pickReviewers` with the publication's `paidSubmissionFee` via `fundSubscriptionWithNative`, so the subscription needs no manual funding as long as fees cover VRF costs.
- **Event Projection:** There are no getters for publications or members. Every state change emits indexed events that Alchemy Notify delivers off-chain; they are projected into Neon Postgres with optimistic concurrency (`blockNumber` + `logIndex` ordering) and serve as the read model for all frontend queries. See [`@packages/cqrs`](../../packages/cqrs/README.md).
- **Tests:** 50 Foundry tests in 12 suites cover 100% of `BioVerifyV3.sol` lines (240/240) and branches (37/37), including VRF edge cases (collisions, a pool that shrinks, rewards that run out) and the slashing paths. Full coverage does not rule out accounting bugs; see the root README's known bugs.

## Infrastructure & Deployment

The deployment pipeline supports cross-chain portability, currently targeting **Base Sepolia (L2)** and **Ethereum Sepolia (L1)**.

- **Dynamic Configuration:** The deploy script utilizes `block.chainid` to inject network-specific parameters (VRF Coordinators, Gas Lanes, Sub IDs) at runtime, keeping core source code immutable.
- **Unified Verification:** Leverages Etherscan API V2 with a universal key, enabling automated source code verification on both Etherscan and Basescan via a single `foundry.toml` configuration.
- **Config Outside the Contract:** Environment variables and network constants live in the deploy script, not in the contract. The script knows Base Sepolia and Ethereum Sepolia; another chain with Chainlink VRF v2.5 needs a new entry there, plus changes in the app.

## Development

Built with [Foundry](https://book.getfoundry.sh/).

```shell
forge build       # compile
forge test        # run tests
forge fmt         # format
forge snapshot    # gas snapshots
```
