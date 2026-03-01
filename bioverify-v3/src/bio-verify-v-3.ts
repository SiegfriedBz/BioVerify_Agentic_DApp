import { BigInt, Bytes, dataSource } from "@graphprotocol/graph-ts"
import {
  Agent_FinalizePublication,
  Agent_PickReviewers,
  IsAvailableReviewer,
  LockedStakeOnPubId,
  MemberAvailableStake,
  MemberLockedStake,
  MemberReputation,
  NewPublicationStatus,
  SubmitPublication
} from "../generated/BioVerifyV3/BioVerifyV3"
import { Member, Publication } from "../generated/schema"

// Helper to create a unique ID across different chains
function getPubId(id: BigInt): string {
  return dataSource.network() + "-" + id.toString()
}

// 1. Create the Publication entity
export function handleSubmitPublication(event: SubmitPublication): void {
  let entity = new Publication(getPubId(event.params.pubId))
  entity.pubId = event.params.pubId
  entity.network = dataSource.network()
  entity.publisher = event.params.publisher
  entity.cid = event.params.cid
  entity.status = 0 // PublicationStatus.SUBMITTED
  entity.lockedStake = BigInt.fromI32(0)
  entity.createdAt = event.block.timestamp
  entity.updatedAt = event.block.timestamp
  entity.save()
}

// 2. Assign Reviewers (including the Senior Reviewer)
export function handleAgentPickReviewers(event: Agent_PickReviewers): void {
  let entity = Publication.load(getPubId(event.params.pubId))
  if (entity) {
    entity.reviewers = changetype<Bytes[]>(event.params.reviewers)
    entity.seniorReviewer = event.params.seniorReviewer
    entity.save()
  }
}

// 3. Finalize (Slash or Publish)
export function handleAgentFinalizePublication(event: Agent_FinalizePublication): void {
  let entity = Publication.load(getPubId(event.params.pubId))
  if (entity) {
    entity.verdictCid = event.params.verdictCid
    entity.status = event.params.status
    entity.updatedAt = event.block.timestamp
    entity.save()
  }
}

// 4. Track any intermediate status changes
export function handleNewPublicationStatus(event: NewPublicationStatus): void {
  let entity = Publication.load(getPubId(event.params.pubId))
  if (entity) {
    entity.status = event.params.status
    entity.save()
  }
}

// 5. Update the precise stake on a paper
export function handleLockedStakeOnPubId(event: LockedStakeOnPubId): void {
  let entity = Publication.load(getPubId(event.params.pubId))
  if (entity) {
    entity.lockedStake = event.params.stake
    entity.save()
  }
}

// --- MEMBER STATE HELPERS ---

function getOrCreateMember(address: Bytes): Member {
  let id = address.toHexString()
  let member = Member.load(id)
  if (!member) {
    member = new Member(id)
    member.reputation = BigInt.fromI32(0)
    member.availableStake = BigInt.fromI32(0)
    member.lockedStake = BigInt.fromI32(0)
    member.isAvailable = false
    member.totalReviews = BigInt.fromI32(0)
  }
  return member
}

export function handleMemberReputation(event: MemberReputation): void {
  let member = getOrCreateMember(event.params.member)
  member.reputation = event.params.reputation
  member.save()
}

export function handleMemberAvailableStake(event: MemberAvailableStake): void {
  let member = getOrCreateMember(event.params.member)
  member.availableStake = event.params.stake
  member.save()
}

export function handleMemberLockedStake(event: MemberLockedStake): void {
  let member = getOrCreateMember(event.params.member)
  member.lockedStake = event.params.stake
  member.save()
}

export function handleIsAvailableReviewer(event: IsAvailableReviewer): void {
  let member = getOrCreateMember(event.params.reviewer)
  member.isAvailable = event.params.isAvailableReviewer
  member.save()
}