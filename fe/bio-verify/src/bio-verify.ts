import {
  BioVerify_Agent_PickReviewers as BioVerify_Agent_PickReviewersEvent,
  BioVerify_Agent_PublishPublication as BioVerify_Agent_PublishPublicationEvent,
  BioVerify_Agent_RequestVRF as BioVerify_Agent_RequestVRFEvent,
  BioVerify_Agent_ReviewRecorded as BioVerify_Agent_ReviewRecordedEvent,
  BioVerify_Agent_RewardReviewer as BioVerify_Agent_RewardReviewerEvent,
  BioVerify_Agent_SetMemberReputation as BioVerify_Agent_SetMemberReputationEvent,
  BioVerify_Agent_SlashMember as BioVerify_Agent_SlashMemberEvent,
  BioVerify_Agent_SlashPublication as BioVerify_Agent_SlashPublicationEvent,
  BioVerify_Agent_SlashPublisher as BioVerify_Agent_SlashPublisherEvent,
  BioVerify_Agent_TransferSlashedPool as BioVerify_Agent_TransferSlashedPoolEvent,
  BioVerify_Claimed as BioVerify_ClaimedEvent,
  BioVerify_PayReviewerMinStake as BioVerify_PayReviewerMinStakeEvent,
  BioVerify_SubmitPublication as BioVerify_SubmitPublicationEvent,
  CoordinatorSet as CoordinatorSetEvent,
  OwnershipTransferRequested as OwnershipTransferRequestedEvent,
  OwnershipTransferred as OwnershipTransferredEvent
} from "../generated/BioVerify/BioVerify"
import {
  BioVerify_Agent_PickReviewers,
  BioVerify_Agent_PublishPublication,
  BioVerify_Agent_RequestVRF,
  BioVerify_Agent_ReviewRecorded,
  BioVerify_Agent_RewardReviewer,
  BioVerify_Agent_SetMemberReputation,
  BioVerify_Agent_SlashMember,
  BioVerify_Agent_SlashPublication,
  BioVerify_Agent_SlashPublisher,
  BioVerify_Agent_TransferSlashedPool,
  BioVerify_Claimed,
  BioVerify_PayReviewerMinStake,
  BioVerify_SubmitPublication,
  CoordinatorSet,
  OwnershipTransferRequested,
  OwnershipTransferred
} from "../generated/schema"
import { Bytes } from "@graphprotocol/graph-ts"

export function handleBioVerify_Agent_PickReviewers(
  event: BioVerify_Agent_PickReviewersEvent
): void {
  let entity = new BioVerify_Agent_PickReviewers(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pubId = event.params.pubId
  entity.reviewers = changetype<Bytes[]>(event.params.reviewers)
  entity.seniorReviewer = event.params.seniorReviewer
  entity.cid = event.params.cid

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBioVerify_Agent_PublishPublication(
  event: BioVerify_Agent_PublishPublicationEvent
): void {
  let entity = new BioVerify_Agent_PublishPublication(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pubId = event.params.pubId
  entity.verdictCid = event.params.verdictCid

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBioVerify_Agent_RequestVRF(
  event: BioVerify_Agent_RequestVRFEvent
): void {
  let entity = new BioVerify_Agent_RequestVRF(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pubId = event.params.pubId
  entity.requestId = event.params.requestId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBioVerify_Agent_ReviewRecorded(
  event: BioVerify_Agent_ReviewRecordedEvent
): void {
  let entity = new BioVerify_Agent_ReviewRecorded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.member = event.params.member
  entity.pubId = event.params.pubId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBioVerify_Agent_RewardReviewer(
  event: BioVerify_Agent_RewardReviewerEvent
): void {
  let entity = new BioVerify_Agent_RewardReviewer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.member = event.params.member
  entity.newReputation = event.params.newReputation
  entity.pubId = event.params.pubId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBioVerify_Agent_SetMemberReputation(
  event: BioVerify_Agent_SetMemberReputationEvent
): void {
  let entity = new BioVerify_Agent_SetMemberReputation(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.member = event.params.member
  entity.newReputation = event.params.newReputation

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBioVerify_Agent_SlashMember(
  event: BioVerify_Agent_SlashMemberEvent
): void {
  let entity = new BioVerify_Agent_SlashMember(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.member = event.params.member
  entity.newReputation = event.params.newReputation
  entity.pubId = event.params.pubId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBioVerify_Agent_SlashPublication(
  event: BioVerify_Agent_SlashPublicationEvent
): void {
  let entity = new BioVerify_Agent_SlashPublication(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pubId = event.params.pubId
  entity.verdictCid = event.params.verdictCid

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBioVerify_Agent_SlashPublisher(
  event: BioVerify_Agent_SlashPublisherEvent
): void {
  let entity = new BioVerify_Agent_SlashPublisher(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pubId = event.params.pubId
  entity.publisher = event.params.publisher
  entity.verdictCid = event.params.verdictCid

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBioVerify_Agent_TransferSlashedPool(
  event: BioVerify_Agent_TransferSlashedPoolEvent
): void {
  let entity = new BioVerify_Agent_TransferSlashedPool(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.to = event.params.to
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBioVerify_Claimed(event: BioVerify_ClaimedEvent): void {
  let entity = new BioVerify_Claimed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.member = event.params.member
  entity.pubId = event.params.pubId
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBioVerify_PayReviewerMinStake(
  event: BioVerify_PayReviewerMinStakeEvent
): void {
  let entity = new BioVerify_PayReviewerMinStake(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.reviewer = event.params.reviewer

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBioVerify_SubmitPublication(
  event: BioVerify_SubmitPublicationEvent
): void {
  let entity = new BioVerify_SubmitPublication(
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
