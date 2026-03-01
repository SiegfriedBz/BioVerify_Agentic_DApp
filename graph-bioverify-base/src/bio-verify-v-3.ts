import {
  Agent_FinalizePublication as Agent_FinalizePublicationEvent,
  Agent_MoveSlashPoolToRewardPool as Agent_MoveSlashPoolToRewardPoolEvent,
  Agent_PickReviewers as Agent_PickReviewersEvent,
  Agent_RecordReview as Agent_RecordReviewEvent,
  Agent_RequestVRF as Agent_RequestVRFEvent,
  Agent_TransferSlashPoolToTreasury as Agent_TransferSlashPoolToTreasuryEvent,
  Claim as ClaimEvent,
  CoordinatorSet as CoordinatorSetEvent,
  IsAvailableReviewer as IsAvailableReviewerEvent,
  LockedStakeOnPubId as LockedStakeOnPubIdEvent,
  MemberAvailableStake as MemberAvailableStakeEvent,
  MemberLockedStake as MemberLockedStakeEvent,
  MemberLockedStakeOnPubId as MemberLockedStakeOnPubIdEvent,
  MemberReputation as MemberReputationEvent,
  NewPublicationStatus as NewPublicationStatusEvent,
  OwnershipTransferRequested as OwnershipTransferRequestedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  RewardMember as RewardMemberEvent,
  RewardPool as RewardPoolEvent,
  SlashMember as SlashMemberEvent,
  SlashPool as SlashPoolEvent,
  SubmitPublication as SubmitPublicationEvent
} from "../generated/BioVerifyV3/BioVerifyV3"
import {
  Agent_FinalizePublication,
  Agent_MoveSlashPoolToRewardPool,
  Agent_PickReviewers,
  Agent_RecordReview,
  Agent_RequestVRF,
  Agent_TransferSlashPoolToTreasury,
  Claim,
  CoordinatorSet,
  IsAvailableReviewer,
  LockedStakeOnPubId,
  MemberAvailableStake,
  MemberLockedStake,
  MemberLockedStakeOnPubId,
  MemberReputation,
  NewPublicationStatus,
  OwnershipTransferRequested,
  OwnershipTransferred,
  RewardMember,
  RewardPool,
  SlashMember,
  SlashPool,
  SubmitPublication
} from "../generated/schema"
import { Bytes } from "@graphprotocol/graph-ts"

export function handleAgent_FinalizePublication(
  event: Agent_FinalizePublicationEvent
): void {
  let entity = new Agent_FinalizePublication(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pubId = event.params.pubId
  entity.verdictCid = event.params.verdictCid
  entity.status = event.params.status

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleAgent_MoveSlashPoolToRewardPool(
  event: Agent_MoveSlashPoolToRewardPoolEvent
): void {
  let entity = new Agent_MoveSlashPoolToRewardPool(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleAgent_PickReviewers(
  event: Agent_PickReviewersEvent
): void {
  let entity = new Agent_PickReviewers(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pubId = event.params.pubId
  entity.publisher = event.params.publisher
  entity.reviewers = changetype<Bytes[]>(event.params.reviewers)
  entity.seniorReviewer = event.params.seniorReviewer
  entity.cid = event.params.cid

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleAgent_RecordReview(event: Agent_RecordReviewEvent): void {
  let entity = new Agent_RecordReview(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.member = event.params.member
  entity.pubId = event.params.pubId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleAgent_RequestVRF(event: Agent_RequestVRFEvent): void {
  let entity = new Agent_RequestVRF(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pubId = event.params.pubId
  entity.requestId = event.params.requestId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleAgent_TransferSlashPoolToTreasury(
  event: Agent_TransferSlashPoolToTreasuryEvent
): void {
  let entity = new Agent_TransferSlashPoolToTreasury(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.to = event.params.to
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleClaim(event: ClaimEvent): void {
  let entity = new Claim(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.member = event.params.member
  entity.claimAmount = event.params.claimAmount
  entity.memberAvailableStake = event.params.memberAvailableStake
  entity.contractBalance = event.params.contractBalance

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCoordinatorSet(event: CoordinatorSetEvent): void {
  let entity = new CoordinatorSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.vrfCoordinator = event.params.vrfCoordinator

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleIsAvailableReviewer(
  event: IsAvailableReviewerEvent
): void {
  let entity = new IsAvailableReviewer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.reviewer = event.params.reviewer
  entity.isAvailableReviewer = event.params.isAvailableReviewer
  entity.currentActiveReviewsCount = event.params.currentActiveReviewsCount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleLockedStakeOnPubId(event: LockedStakeOnPubIdEvent): void {
  let entity = new LockedStakeOnPubId(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pubId = event.params.pubId
  entity.stake = event.params.stake

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMemberAvailableStake(
  event: MemberAvailableStakeEvent
): void {
  let entity = new MemberAvailableStake(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.member = event.params.member
  entity.stake = event.params.stake

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMemberLockedStake(event: MemberLockedStakeEvent): void {
  let entity = new MemberLockedStake(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.member = event.params.member
  entity.stake = event.params.stake

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMemberLockedStakeOnPubId(
  event: MemberLockedStakeOnPubIdEvent
): void {
  let entity = new MemberLockedStakeOnPubId(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.member = event.params.member
  entity.pubId = event.params.pubId
  entity.stake = event.params.stake

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMemberReputation(event: MemberReputationEvent): void {
  let entity = new MemberReputation(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.member = event.params.member
  entity.reputation = event.params.reputation

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNewPublicationStatus(
  event: NewPublicationStatusEvent
): void {
  let entity = new NewPublicationStatus(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pubId = event.params.pubId
  entity.status = event.params.status

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferRequested(
  event: OwnershipTransferRequestedEvent
): void {
  let entity = new OwnershipTransferRequested(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRewardMember(event: RewardMemberEvent): void {
  let entity = new RewardMember(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.member = event.params.member

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRewardPool(event: RewardPoolEvent): void {
  let entity = new RewardPool(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.rewardPool = event.params.rewardPool

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSlashMember(event: SlashMemberEvent): void {
  let entity = new SlashMember(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.member = event.params.member

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSlashPool(event: SlashPoolEvent): void {
  let entity = new SlashPool(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.slashPool = event.params.slashPool

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSubmitPublication(event: SubmitPublicationEvent): void {
  let entity = new SubmitPublication(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.publisher = event.params.publisher
  entity.pubId = event.params.pubId
  entity.cid = event.params.cid

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
