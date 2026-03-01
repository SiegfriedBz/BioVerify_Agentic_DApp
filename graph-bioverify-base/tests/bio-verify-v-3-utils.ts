import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
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
} from "../generated/BioVerifyV3/BioVerifyV3"

export function createAgent_FinalizePublicationEvent(
  pubId: BigInt,
  verdictCid: string,
  status: i32
): Agent_FinalizePublication {
  let agentFinalizePublicationEvent =
    changetype<Agent_FinalizePublication>(newMockEvent())

  agentFinalizePublicationEvent.parameters = new Array()

  agentFinalizePublicationEvent.parameters.push(
    new ethereum.EventParam("pubId", ethereum.Value.fromUnsignedBigInt(pubId))
  )
  agentFinalizePublicationEvent.parameters.push(
    new ethereum.EventParam("verdictCid", ethereum.Value.fromString(verdictCid))
  )
  agentFinalizePublicationEvent.parameters.push(
    new ethereum.EventParam(
      "status",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(status))
    )
  )

  return agentFinalizePublicationEvent
}

export function createAgent_MoveSlashPoolToRewardPoolEvent(
  value: BigInt
): Agent_MoveSlashPoolToRewardPool {
  let agentMoveSlashPoolToRewardPoolEvent =
    changetype<Agent_MoveSlashPoolToRewardPool>(newMockEvent())

  agentMoveSlashPoolToRewardPoolEvent.parameters = new Array()

  agentMoveSlashPoolToRewardPoolEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return agentMoveSlashPoolToRewardPoolEvent
}

export function createAgent_PickReviewersEvent(
  pubId: BigInt,
  publisher: Address,
  reviewers: Array<Address>,
  seniorReviewer: Address,
  cid: string
): Agent_PickReviewers {
  let agentPickReviewersEvent = changetype<Agent_PickReviewers>(newMockEvent())

  agentPickReviewersEvent.parameters = new Array()

  agentPickReviewersEvent.parameters.push(
    new ethereum.EventParam("pubId", ethereum.Value.fromUnsignedBigInt(pubId))
  )
  agentPickReviewersEvent.parameters.push(
    new ethereum.EventParam("publisher", ethereum.Value.fromAddress(publisher))
  )
  agentPickReviewersEvent.parameters.push(
    new ethereum.EventParam(
      "reviewers",
      ethereum.Value.fromAddressArray(reviewers)
    )
  )
  agentPickReviewersEvent.parameters.push(
    new ethereum.EventParam(
      "seniorReviewer",
      ethereum.Value.fromAddress(seniorReviewer)
    )
  )
  agentPickReviewersEvent.parameters.push(
    new ethereum.EventParam("cid", ethereum.Value.fromString(cid))
  )

  return agentPickReviewersEvent
}

export function createAgent_RecordReviewEvent(
  member: Address,
  pubId: BigInt
): Agent_RecordReview {
  let agentRecordReviewEvent = changetype<Agent_RecordReview>(newMockEvent())

  agentRecordReviewEvent.parameters = new Array()

  agentRecordReviewEvent.parameters.push(
    new ethereum.EventParam("member", ethereum.Value.fromAddress(member))
  )
  agentRecordReviewEvent.parameters.push(
    new ethereum.EventParam("pubId", ethereum.Value.fromUnsignedBigInt(pubId))
  )

  return agentRecordReviewEvent
}

export function createAgent_RequestVRFEvent(
  pubId: BigInt,
  requestId: BigInt
): Agent_RequestVRF {
  let agentRequestVrfEvent = changetype<Agent_RequestVRF>(newMockEvent())

  agentRequestVrfEvent.parameters = new Array()

  agentRequestVrfEvent.parameters.push(
    new ethereum.EventParam("pubId", ethereum.Value.fromUnsignedBigInt(pubId))
  )
  agentRequestVrfEvent.parameters.push(
    new ethereum.EventParam(
      "requestId",
      ethereum.Value.fromUnsignedBigInt(requestId)
    )
  )

  return agentRequestVrfEvent
}

export function createAgent_TransferSlashPoolToTreasuryEvent(
  to: Address,
  value: BigInt
): Agent_TransferSlashPoolToTreasury {
  let agentTransferSlashPoolToTreasuryEvent =
    changetype<Agent_TransferSlashPoolToTreasury>(newMockEvent())

  agentTransferSlashPoolToTreasuryEvent.parameters = new Array()

  agentTransferSlashPoolToTreasuryEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  agentTransferSlashPoolToTreasuryEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return agentTransferSlashPoolToTreasuryEvent
}

export function createClaimEvent(
  member: Address,
  claimAmount: BigInt,
  memberAvailableStake: BigInt,
  contractBalance: BigInt
): Claim {
  let claimEvent = changetype<Claim>(newMockEvent())

  claimEvent.parameters = new Array()

  claimEvent.parameters.push(
    new ethereum.EventParam("member", ethereum.Value.fromAddress(member))
  )
  claimEvent.parameters.push(
    new ethereum.EventParam(
      "claimAmount",
      ethereum.Value.fromUnsignedBigInt(claimAmount)
    )
  )
  claimEvent.parameters.push(
    new ethereum.EventParam(
      "memberAvailableStake",
      ethereum.Value.fromUnsignedBigInt(memberAvailableStake)
    )
  )
  claimEvent.parameters.push(
    new ethereum.EventParam(
      "contractBalance",
      ethereum.Value.fromUnsignedBigInt(contractBalance)
    )
  )

  return claimEvent
}

export function createCoordinatorSetEvent(
  vrfCoordinator: Address
): CoordinatorSet {
  let coordinatorSetEvent = changetype<CoordinatorSet>(newMockEvent())

  coordinatorSetEvent.parameters = new Array()

  coordinatorSetEvent.parameters.push(
    new ethereum.EventParam(
      "vrfCoordinator",
      ethereum.Value.fromAddress(vrfCoordinator)
    )
  )

  return coordinatorSetEvent
}

export function createIsAvailableReviewerEvent(
  reviewer: Address,
  isAvailableReviewer: boolean,
  currentActiveReviewsCount: BigInt
): IsAvailableReviewer {
  let isAvailableReviewerEvent = changetype<IsAvailableReviewer>(newMockEvent())

  isAvailableReviewerEvent.parameters = new Array()

  isAvailableReviewerEvent.parameters.push(
    new ethereum.EventParam("reviewer", ethereum.Value.fromAddress(reviewer))
  )
  isAvailableReviewerEvent.parameters.push(
    new ethereum.EventParam(
      "isAvailableReviewer",
      ethereum.Value.fromBoolean(isAvailableReviewer)
    )
  )
  isAvailableReviewerEvent.parameters.push(
    new ethereum.EventParam(
      "currentActiveReviewsCount",
      ethereum.Value.fromUnsignedBigInt(currentActiveReviewsCount)
    )
  )

  return isAvailableReviewerEvent
}

export function createLockedStakeOnPubIdEvent(
  pubId: BigInt,
  stake: BigInt
): LockedStakeOnPubId {
  let lockedStakeOnPubIdEvent = changetype<LockedStakeOnPubId>(newMockEvent())

  lockedStakeOnPubIdEvent.parameters = new Array()

  lockedStakeOnPubIdEvent.parameters.push(
    new ethereum.EventParam("pubId", ethereum.Value.fromUnsignedBigInt(pubId))
  )
  lockedStakeOnPubIdEvent.parameters.push(
    new ethereum.EventParam("stake", ethereum.Value.fromUnsignedBigInt(stake))
  )

  return lockedStakeOnPubIdEvent
}

export function createMemberAvailableStakeEvent(
  member: Address,
  stake: BigInt
): MemberAvailableStake {
  let memberAvailableStakeEvent =
    changetype<MemberAvailableStake>(newMockEvent())

  memberAvailableStakeEvent.parameters = new Array()

  memberAvailableStakeEvent.parameters.push(
    new ethereum.EventParam("member", ethereum.Value.fromAddress(member))
  )
  memberAvailableStakeEvent.parameters.push(
    new ethereum.EventParam("stake", ethereum.Value.fromUnsignedBigInt(stake))
  )

  return memberAvailableStakeEvent
}

export function createMemberLockedStakeEvent(
  member: Address,
  stake: BigInt
): MemberLockedStake {
  let memberLockedStakeEvent = changetype<MemberLockedStake>(newMockEvent())

  memberLockedStakeEvent.parameters = new Array()

  memberLockedStakeEvent.parameters.push(
    new ethereum.EventParam("member", ethereum.Value.fromAddress(member))
  )
  memberLockedStakeEvent.parameters.push(
    new ethereum.EventParam("stake", ethereum.Value.fromUnsignedBigInt(stake))
  )

  return memberLockedStakeEvent
}

export function createMemberLockedStakeOnPubIdEvent(
  member: Address,
  pubId: BigInt,
  stake: BigInt
): MemberLockedStakeOnPubId {
  let memberLockedStakeOnPubIdEvent =
    changetype<MemberLockedStakeOnPubId>(newMockEvent())

  memberLockedStakeOnPubIdEvent.parameters = new Array()

  memberLockedStakeOnPubIdEvent.parameters.push(
    new ethereum.EventParam("member", ethereum.Value.fromAddress(member))
  )
  memberLockedStakeOnPubIdEvent.parameters.push(
    new ethereum.EventParam("pubId", ethereum.Value.fromUnsignedBigInt(pubId))
  )
  memberLockedStakeOnPubIdEvent.parameters.push(
    new ethereum.EventParam("stake", ethereum.Value.fromUnsignedBigInt(stake))
  )

  return memberLockedStakeOnPubIdEvent
}

export function createMemberReputationEvent(
  member: Address,
  reputation: BigInt
): MemberReputation {
  let memberReputationEvent = changetype<MemberReputation>(newMockEvent())

  memberReputationEvent.parameters = new Array()

  memberReputationEvent.parameters.push(
    new ethereum.EventParam("member", ethereum.Value.fromAddress(member))
  )
  memberReputationEvent.parameters.push(
    new ethereum.EventParam(
      "reputation",
      ethereum.Value.fromUnsignedBigInt(reputation)
    )
  )

  return memberReputationEvent
}

export function createNewPublicationStatusEvent(
  pubId: BigInt,
  status: i32
): NewPublicationStatus {
  let newPublicationStatusEvent =
    changetype<NewPublicationStatus>(newMockEvent())

  newPublicationStatusEvent.parameters = new Array()

  newPublicationStatusEvent.parameters.push(
    new ethereum.EventParam("pubId", ethereum.Value.fromUnsignedBigInt(pubId))
  )
  newPublicationStatusEvent.parameters.push(
    new ethereum.EventParam(
      "status",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(status))
    )
  )

  return newPublicationStatusEvent
}

export function createOwnershipTransferRequestedEvent(
  from: Address,
  to: Address
): OwnershipTransferRequested {
  let ownershipTransferRequestedEvent =
    changetype<OwnershipTransferRequested>(newMockEvent())

  ownershipTransferRequestedEvent.parameters = new Array()

  ownershipTransferRequestedEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  ownershipTransferRequestedEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )

  return ownershipTransferRequestedEvent
}

export function createOwnershipTransferredEvent(
  from: Address,
  to: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )

  return ownershipTransferredEvent
}

export function createRewardMemberEvent(member: Address): RewardMember {
  let rewardMemberEvent = changetype<RewardMember>(newMockEvent())

  rewardMemberEvent.parameters = new Array()

  rewardMemberEvent.parameters.push(
    new ethereum.EventParam("member", ethereum.Value.fromAddress(member))
  )

  return rewardMemberEvent
}

export function createRewardPoolEvent(rewardPool: BigInt): RewardPool {
  let rewardPoolEvent = changetype<RewardPool>(newMockEvent())

  rewardPoolEvent.parameters = new Array()

  rewardPoolEvent.parameters.push(
    new ethereum.EventParam(
      "rewardPool",
      ethereum.Value.fromUnsignedBigInt(rewardPool)
    )
  )

  return rewardPoolEvent
}

export function createSlashMemberEvent(member: Address): SlashMember {
  let slashMemberEvent = changetype<SlashMember>(newMockEvent())

  slashMemberEvent.parameters = new Array()

  slashMemberEvent.parameters.push(
    new ethereum.EventParam("member", ethereum.Value.fromAddress(member))
  )

  return slashMemberEvent
}

export function createSlashPoolEvent(slashPool: BigInt): SlashPool {
  let slashPoolEvent = changetype<SlashPool>(newMockEvent())

  slashPoolEvent.parameters = new Array()

  slashPoolEvent.parameters.push(
    new ethereum.EventParam(
      "slashPool",
      ethereum.Value.fromUnsignedBigInt(slashPool)
    )
  )

  return slashPoolEvent
}

export function createSubmitPublicationEvent(
  publisher: Address,
  pubId: BigInt,
  cid: string
): SubmitPublication {
  let submitPublicationEvent = changetype<SubmitPublication>(newMockEvent())

  submitPublicationEvent.parameters = new Array()

  submitPublicationEvent.parameters.push(
    new ethereum.EventParam("publisher", ethereum.Value.fromAddress(publisher))
  )
  submitPublicationEvent.parameters.push(
    new ethereum.EventParam("pubId", ethereum.Value.fromUnsignedBigInt(pubId))
  )
  submitPublicationEvent.parameters.push(
    new ethereum.EventParam("cid", ethereum.Value.fromString(cid))
  )

  return submitPublicationEvent
}
