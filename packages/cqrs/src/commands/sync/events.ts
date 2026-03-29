import { startReviewersAgent, startSubmissionAgent } from "@packages/agents"
import { db } from "@packages/db"
import { memberDbSchema, protocolDbSchema, publicationDbSchema } from '@packages/schema'
import { ChainIdToNetwork } from "@packages/utils"
import { and, eq, sql } from "drizzle-orm"

/**
 * Optimistic Concurrency Control (OCC)
 * Ensures out-of-order webhook events never overwrite newer data.
 */
function versionCheck(table: any, blockNumber: bigint, logIndex: number) {
  return sql`(${table.lastBlockNumber} < ${blockNumber}) OR (${table.lastBlockNumber} = ${blockNumber} AND ${table.lastLogIndex} < ${logIndex})`
}

export async function processContractEvent(
  chainId: number,
  decoded: { eventName: string; args: any },
  blockNumber: bigint,
  logIndex: number
) {
  const { eventName, args } = decoded
  const mId = (addr: string) => `${chainId}-${addr.toLowerCase()}`
  const pId = (id: bigint) => `${chainId}-${id.toString()}`

  switch (eventName) {
    // --- PROTOCOL POOLS ---
    case "RewardPool":
      await upsertProtocol(chainId, { rewardPool: args.newRewardPool }, blockNumber, logIndex)
      break

    case "SlashPool":
      await upsertProtocol(chainId, { slashPool: args.newSlashPool }, blockNumber, logIndex)
      break

    case "Agent_MoveSlashPoolToRewardPool":
      await upsertProtocol(chainId, { slashPool: args.newSlashPool, rewardPool: args.newRewardPool }, blockNumber, logIndex)
      break

    case "Agent_TransferSlashPoolToTreasury":
      await upsertProtocol(chainId, { slashPool: args.newSlashPool }, blockNumber, logIndex)
      break

    // --- MEMBER STATE ---
    case "MemberAvailableStake":
      await upsertMember(mId(args.member), { address: args.member.toLowerCase(), chainId, availableStake: args.newAvailStake }, blockNumber, logIndex)
      break

    case "MemberLockedStake":
      await upsertMember(mId(args.member), { address: args.member.toLowerCase(), chainId, lockedStake: args.newLockedStake }, blockNumber, logIndex)
      break

    case "MemberReputation":
      await upsertMember(mId(args.member), { address: args.member.toLowerCase(), chainId, reputation: args.newRep }, blockNumber, logIndex)
      break

    case "IsAvailableReviewer":
      await upsertMember(mId(args.reviewer), { address: args.reviewer.toLowerCase(), chainId, isAvailable: args.isAvailable, activeReviewsCount: Number(args.newActiveReviews) }, blockNumber, logIndex)
      break

    case "RewardMember":
      await db.update(memberDbSchema)
        .set({ rewardsCount: sql`${memberDbSchema.rewardsCount} + 1`, updatedAt: new Date() })
        .where(and(eq(memberDbSchema.id, mId(args.member)), versionCheck(memberDbSchema, blockNumber, logIndex)))
      break

    case "SlashMember":
      await db.update(memberDbSchema)
        .set({ slashesCount: sql`${memberDbSchema.slashesCount} + 1`, updatedAt: new Date() })
        .where(and(eq(memberDbSchema.id, mId(args.member)), versionCheck(memberDbSchema, blockNumber, logIndex)))
      break

    // --- PUBLICATION STATE ---
    case "SubmitPublication": {
      const { pubId, cid, publisher, paidFee } = args
      await upsertPublication(pId(pubId), {
        pubId, chainId, publisher: publisher.toLowerCase(), cid, paidSubmissionFee: paidFee, status: 0
      }, blockNumber, logIndex)

      await startSubmissionAgent({
        publicationId: pubId.toString(), rootCid: cid, network: ChainIdToNetwork[chainId]
      }).catch(err => console.error(`❌ Submission Agent failed (Pub #${pubId}):`, err))
      break
    }

    case "LockedStakeOnPubId":
      await upsertPublication(pId(args.pubId), { lockedStake: args.newLockedStake }, blockNumber, logIndex)
      break

    case "NewPublicationStatus":
      await upsertPublication(pId(args.pubId), { status: args.newStatus }, blockNumber, logIndex)
      break

    case "Agent_PickReviewers": {
      const { pubId, cid, seniorReviewer } = args
      const reviewers = args.reviewers.map((a: string) => a.toLowerCase())

      await upsertPublication(pId(pubId), { reviewers, seniorReviewer: seniorReviewer.toLowerCase(), status: 2 }, blockNumber, logIndex)

      await startReviewersAgent({
        publicationId: pubId.toString(), rootCid: cid, reviewers, seniorReviewer: seniorReviewer.toLowerCase(), network: ChainIdToNetwork[chainId]
      }).catch(err => console.error(`❌ Reviewers Agent failed (Pub #${pubId}):`, err))
      break
    }

    case "Agent_RecordReview": {
      const { member: reviewerMember, pubId } = args
      if (!reviewerMember || !pubId) break

      await db.update(publicationDbSchema)
        .set({
          reviewersStatus: sql`${publicationDbSchema.reviewersStatus} || jsonb_build_object(${reviewerMember.toLowerCase()}::text, true)`,
          lastBlockNumber: blockNumber, lastLogIndex: logIndex, updatedAt: new Date()
        })
        .where(and(eq(publicationDbSchema.id, pId(pubId)), versionCheck(publicationDbSchema, blockNumber, logIndex)))
      break
    }

    case "Agent_FinalizePublication":
      await upsertPublication(pId(args.pubId), { verdictCid: args.verdictCid, status: args.status }, blockNumber, logIndex)
      break
  }
}

// --- PRIVATE UPSERT HELPERS ---
async function upsertMember(id: string, data: any, blockNumber: bigint, logIndex: number) {
  await db.insert(memberDbSchema).values({ id, ...data, lastBlockNumber: blockNumber, lastLogIndex: logIndex })
    .onConflictDoUpdate({ target: memberDbSchema.id, set: { ...data, lastBlockNumber: blockNumber, lastLogIndex: logIndex, updatedAt: new Date() }, where: versionCheck(memberDbSchema, blockNumber, logIndex) })
}

async function upsertPublication(id: string, data: any, blockNumber: bigint, logIndex: number) {
  await db.insert(publicationDbSchema).values({ id, ...data, lastBlockNumber: blockNumber, lastLogIndex: logIndex })
    .onConflictDoUpdate({ target: publicationDbSchema.id, set: { ...data, lastBlockNumber: blockNumber, lastLogIndex: logIndex, updatedAt: new Date() }, where: versionCheck(publicationDbSchema, blockNumber, logIndex) })
}

async function upsertProtocol(chainId: number, data: any, blockNumber: bigint, logIndex: number) {
  await db.update(protocolDbSchema).set({ ...data, lastBlockNumber: blockNumber, lastLogIndex: logIndex, updatedAt: new Date() })
    .where(and(eq(protocolDbSchema.id, chainId.toString()), versionCheck(protocolDbSchema, blockNumber, logIndex)))
}