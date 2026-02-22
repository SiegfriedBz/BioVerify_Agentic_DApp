import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
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
} from "../generated/BioVerify/BioVerify"

export function createBioVerify_Agent_PickReviewersEvent(
  pubId: BigInt,
  reviewers: Array<Address>,
  seniorReviewer: Address,
  cid: string
): BioVerify_Agent_PickReviewers {
  let bioVerifyAgentPickReviewersEvent =
    changetype<BioVerify_Agent_PickReviewers>(newMockEvent())

  bioVerifyAgentPickReviewersEvent.parameters = new Array()

  bioVerifyAgentPickReviewersEvent.parameters.push(
    new ethereum.EventParam("pubId", ethereum.Value.fromUnsignedBigInt(pubId))
  )
  bioVerifyAgentPickReviewersEvent.parameters.push(
    new ethereum.EventParam(
      "reviewers",
      ethereum.Value.fromAddressArray(reviewers)
    )
  )
  bioVerifyAgentPickReviewersEvent.parameters.push(
    new ethereum.EventParam(
      "seniorReviewer",
      ethereum.Value.fromAddress(seniorReviewer)
    )
  )
  bioVerifyAgentPickReviewersEvent.parameters.push(
    new ethereum.EventParam("cid", ethereum.Value.fromString(cid))
  )

  return bioVerifyAgentPickReviewersEvent
}

export function createBioVerify_Agent_PublishPublicationEvent(
  pubId: BigInt,
  verdictCid: string
): BioVerify_Agent_PublishPublication {
  let bioVerifyAgentPublishPublicationEvent =
    changetype<BioVerify_Agent_PublishPublication>(newMockEvent())

  bioVerifyAgentPublishPublicationEvent.parameters = new Array()

  bioVerifyAgentPublishPublicationEvent.parameters.push(
    new ethereum.EventParam("pubId", ethereum.Value.fromUnsignedBigInt(pubId))
  )
  bioVerifyAgentPublishPublicationEvent.parameters.push(
    new ethereum.EventParam("verdictCid", ethereum.Value.fromString(verdictCid))
  )

  return bioVerifyAgentPublishPublicationEvent
}

export function createBioVerify_Agent_RequestVRFEvent(
  pubId: BigInt,
  requestId: BigInt
): BioVerify_Agent_RequestVRF {
  let bioVerifyAgentRequestVrfEvent =
    changetype<BioVerify_Agent_RequestVRF>(newMockEvent())

  bioVerifyAgentRequestVrfEvent.parameters = new Array()

  bioVerifyAgentRequestVrfEvent.parameters.push(
    new ethereum.EventParam("pubId", ethereum.Value.fromUnsignedBigInt(pubId))
  )
  bioVerifyAgentRequestVrfEvent.parameters.push(
    new ethereum.EventParam(
      "requestId",
      ethereum.Value.fromUnsignedBigInt(requestId)
    )
  )

  return bioVerifyAgentRequestVrfEvent
}

export function createBioVerify_Agent_ReviewRecordedEvent(
  member: Address,
  pubId: BigInt
): BioVerify_Agent_ReviewRecorded {
  let bioVerifyAgentReviewRecordedEvent =
    changetype<BioVerify_Agent_ReviewRecorded>(newMockEvent())

  bioVerifyAgentReviewRecordedEvent.parameters = new Array()

  bioVerifyAgentReviewRecordedEvent.parameters.push(
    new ethereum.EventParam("member", ethereum.Value.fromAddress(member))
  )
  bioVerifyAgentReviewRecordedEvent.parameters.push(
    new ethereum.EventParam("pubId", ethereum.Value.fromUnsignedBigInt(pubId))
  )

  return bioVerifyAgentReviewRecordedEvent
}

export function createBioVerify_Agent_RewardReviewerEvent(
  member: Address,
  newReputation: BigInt,
  pubId: BigInt
): BioVerify_Agent_RewardReviewer {
  let bioVerifyAgentRewardReviewerEvent =
    changetype<BioVerify_Agent_RewardReviewer>(newMockEvent())

  bioVerifyAgentRewardReviewerEvent.parameters = new Array()

  bioVerifyAgentRewardReviewerEvent.parameters.push(
    new ethereum.EventParam("member", ethereum.Value.fromAddress(member))
  )
  bioVerifyAgentRewardReviewerEvent.parameters.push(
    new ethereum.EventParam(
      "newReputation",
      ethereum.Value.fromUnsignedBigInt(newReputation)
    )
  )
  bioVerifyAgentRewardReviewerEvent.parameters.push(
    new ethereum.EventParam("pubId", ethereum.Value.fromUnsignedBigInt(pubId))
  )

  return bioVerifyAgentRewardReviewerEvent
}

export function createBioVerify_Agent_SetMemberReputationEvent(
  member: Address,
  newReputation: BigInt
): BioVerify_Agent_SetMemberReputation {
  let bioVerifyAgentSetMemberReputationEvent =
    changetype<BioVerify_Agent_SetMemberReputation>(newMockEvent())

  bioVerifyAgentSetMemberReputationEvent.parameters = new Array()

  bioVerifyAgentSetMemberReputationEvent.parameters.push(
    new ethereum.EventParam("member", ethereum.Value.fromAddress(member))
  )
  bioVerifyAgentSetMemberReputationEvent.parameters.push(
    new ethereum.EventParam(
      "newReputation",
      ethereum.Value.fromUnsignedBigInt(newReputation)
    )
  )

  return bioVerifyAgentSetMemberReputationEvent
}

export function createBioVerify_Agent_SlashMemberEvent(
  member: Address,
  newReputation: BigInt,
  pubId: BigInt
): BioVerify_Agent_SlashMember {
  let bioVerifyAgentSlashMemberEvent =
    changetype<BioVerify_Agent_SlashMember>(newMockEvent())

  bioVerifyAgentSlashMemberEvent.parameters = new Array()

  bioVerifyAgentSlashMemberEvent.parameters.push(
    new ethereum.EventParam("member", ethereum.Value.fromAddress(member))
  )
  bioVerifyAgentSlashMemberEvent.parameters.push(
    new ethereum.EventParam(
      "newReputation",
      ethereum.Value.fromUnsignedBigInt(newReputation)
    )
  )
  bioVerifyAgentSlashMemberEvent.parameters.push(
    new ethereum.EventParam("pubId", ethereum.Value.fromUnsignedBigInt(pubId))
  )

  return bioVerifyAgentSlashMemberEvent
}

export function createBioVerify_Agent_SlashPublicationEvent(
  pubId: BigInt,
  verdictCid: string
): BioVerify_Agent_SlashPublication {
  let bioVerifyAgentSlashPublicationEvent =
    changetype<BioVerify_Agent_SlashPublication>(newMockEvent())

  bioVerifyAgentSlashPublicationEvent.parameters = new Array()

  bioVerifyAgentSlashPublicationEvent.parameters.push(
    new ethereum.EventParam("pubId", ethereum.Value.fromUnsignedBigInt(pubId))
  )
  bioVerifyAgentSlashPublicationEvent.parameters.push(
    new ethereum.EventParam("verdictCid", ethereum.Value.fromString(verdictCid))
  )

  return bioVerifyAgentSlashPublicationEvent
}

export function createBioVerify_Agent_SlashPublisherEvent(
  pubId: BigInt,
  publisher: Address,
  verdictCid: string
): BioVerify_Agent_SlashPublisher {
  let bioVerifyAgentSlashPublisherEvent =
    changetype<BioVerify_Agent_SlashPublisher>(newMockEvent())

  bioVerifyAgentSlashPublisherEvent.parameters = new Array()

  bioVerifyAgentSlashPublisherEvent.parameters.push(
    new ethereum.EventParam("pubId", ethereum.Value.fromUnsignedBigInt(pubId))
  )
  bioVerifyAgentSlashPublisherEvent.parameters.push(
    new ethereum.EventParam("publisher", ethereum.Value.fromAddress(publisher))
  )
  bioVerifyAgentSlashPublisherEvent.parameters.push(
    new ethereum.EventParam("verdictCid", ethereum.Value.fromString(verdictCid))
  )

  return bioVerifyAgentSlashPublisherEvent
}

export function createBioVerify_Agent_TransferSlashedPoolEvent(
  to: Address,
  value: BigInt
): BioVerify_Agent_TransferSlashedPool {
  let bioVerifyAgentTransferSlashedPoolEvent =
    changetype<BioVerify_Agent_TransferSlashedPool>(newMockEvent())

  bioVerifyAgentTransferSlashedPoolEvent.parameters = new Array()

  bioVerifyAgentTransferSlashedPoolEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  bioVerifyAgentTransferSlashedPoolEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return bioVerifyAgentTransferSlashedPoolEvent
}

export function createBioVerify_ClaimedEvent(
  member: Address,
  pubId: BigInt,
  amount: BigInt
): BioVerify_Claimed {
  let bioVerifyClaimedEvent = changetype<BioVerify_Claimed>(newMockEvent())

  bioVerifyClaimedEvent.parameters = new Array()

  bioVerifyClaimedEvent.parameters.push(
    new ethereum.EventParam("member", ethereum.Value.fromAddress(member))
  )
  bioVerifyClaimedEvent.parameters.push(
    new ethereum.EventParam("pubId", ethereum.Value.fromUnsignedBigInt(pubId))
  )
  bioVerifyClaimedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return bioVerifyClaimedEvent
}

export function createBioVerify_PayReviewerMinStakeEvent(
  reviewer: Address
): BioVerify_PayReviewerMinStake {
  let bioVerifyPayReviewerMinStakeEvent =
    changetype<BioVerify_PayReviewerMinStake>(newMockEvent())

  bioVerifyPayReviewerMinStakeEvent.parameters = new Array()

  bioVerifyPayReviewerMinStakeEvent.parameters.push(
    new ethereum.EventParam("reviewer", ethereum.Value.fromAddress(reviewer))
  )

  return bioVerifyPayReviewerMinStakeEvent
}

export function createBioVerify_SubmitPublicationEvent(
  publisher: Address,
  pubId: BigInt,
  cid: string
): BioVerify_SubmitPublication {
  let bioVerifySubmitPublicationEvent =
    changetype<BioVerify_SubmitPublication>(newMockEvent())

  bioVerifySubmitPublicationEvent.parameters = new Array()

  bioVerifySubmitPublicationEvent.parameters.push(
    new ethereum.EventParam("publisher", ethereum.Value.fromAddress(publisher))
  )
  bioVerifySubmitPublicationEvent.parameters.push(
    new ethereum.EventParam("pubId", ethereum.Value.fromUnsignedBigInt(pubId))
  )
  bioVerifySubmitPublicationEvent.parameters.push(
    new ethereum.EventParam("cid", ethereum.Value.fromString(cid))
  )

  return bioVerifySubmitPublicationEvent
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
