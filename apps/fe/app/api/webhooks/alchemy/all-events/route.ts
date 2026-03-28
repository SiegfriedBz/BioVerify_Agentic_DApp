
import { processContractEvent } from "@packages/cqrs"
import { env } from "@packages/env"
import { NetworkSchema, NetworkT } from "@packages/schema"
import { bioVerifyAbi, NetworkToChainId } from "@packages/utils"
import { waitUntil } from "@vercel/functions"
import { createHmac } from "crypto"
import { NextResponse } from "next/server"
import { decodeEventLog } from "viem"

const SECRETS: Record<NetworkT, string | undefined> = {
  [NetworkSchema.enum.base_sepolia]: env.ALCHEMY_BASE_SEPOLIA_WH_SK,
  [NetworkSchema.enum.eth_sepolia]: env.ALCHEMY_ETH_SEPOLIA_WH_SK,
}

export async function POST(req: Request) {
  const signature = req.headers.get("x-alchemy-signature")
  const rawBody = await req.text()
  if (!signature) return new Response("Missing signature", { status: 401 })

  const isValid = (secret: string) =>
    createHmac("sha256", secret).update(rawBody).digest("hex") === signature

  let activeChainId: number | null = null
  if (SECRETS.base_sepolia && isValid(SECRETS.base_sepolia)) {
    activeChainId = NetworkToChainId[NetworkSchema.enum.base_sepolia]
  } else if (SECRETS.eth_sepolia && isValid(SECRETS.eth_sepolia)) {
    activeChainId = NetworkToChainId[NetworkSchema.enum.eth_sepolia]
  }

  if (!activeChainId) return NextResponse.json({ error: "Invalid signature" }, { status: 401 })

  const json = JSON.parse(rawBody)
  const logs = json.event?.data?.block?.logs || []
  const blockNumber = BigInt(json.event?.data?.block?.number || 0)

  waitUntil((async () => {
    for (const log of logs) {
      try {
        const decoded = decodeEventLog({
          abi: bioVerifyAbi,
          data: log.data,
          topics: log.topics,
        })

        if (!decoded.eventName) {
          console.warn(`[Webhook] Skipping anonymous/undecoded event at block ${blockNumber}`)
          continue
        }

        // Call the CQRS handler
        await processContractEvent(
          activeChainId as number,
          decoded as unknown as { eventName: string, args: any },
          blockNumber,
          Number(log.index)
        )

      } catch (e) {
        console.error(`[Webhook] Failed to process log at block ${blockNumber}:`, e)
      }
    }
  })())

  return NextResponse.json({ received: true })
}

// async function processContractEvent(chainId: number, decoded: any, blockNumber: bigint, logIndex: number) {
//   const { eventName, args } = decoded

//   const mId = (addr: string) => `${chainId}-${addr.toLowerCase()}`
//   const pId = (id: bigint) => `${chainId}-${id.toString()}`

//   switch (eventName) {
//     // --- PROTOCOL POOLS ---
//     case "RewardPool":
//       console.log("Alchemy Webhook RewardPool")
//       await upsertProtocol(chainId, { rewardPool: args.newRewardPool }, blockNumber, logIndex)
//       break

//     case "SlashPool":
//       console.log("Alchemy Webhook SlashPool")
//       await upsertProtocol(chainId, { slashPool: args.newSlashPool }, blockNumber, logIndex)
//       break

//     case "Agent_MoveSlashPoolToRewardPool":
//       console.log("Alchemy Webhook Agent_MoveSlashPoolToRewardPool")
//       await upsertProtocol(chainId, {
//         slashPool: args.newSlashPool,
//         rewardPool: args.newRewardPool
//       }, blockNumber, logIndex)
//       break

//     case "Agent_TransferSlashPoolToTreasury":
//       console.log("Alchemy Webhook Agent_TransferSlashPoolToTreasury")
//       await upsertProtocol(chainId, { slashPool: args.newSlashPool }, blockNumber, logIndex)
//       break

//     // --- MEMBER STATE ---
//     case "MemberAvailableStake":
//       console.log("Alchemy Webhook MemberAvailableStake")
//       await upsertMember(mId(args.member), {
//         address: args.member.toLowerCase(), chainId, availableStake: args.newAvailStake
//       }, blockNumber, logIndex)
//       break

//     case "MemberLockedStake":
//       console.log("Alchemy Webhook MemberLockedStake")
//       await upsertMember(mId(args.member), {
//         address: args.member.toLowerCase(), chainId, lockedStake: args.newLockedStake
//       }, blockNumber, logIndex)
//       break

//     case "MemberReputation":
//       console.log("Alchemy Webhook MemberReputation")
//       await upsertMember(mId(args.member), {
//         address: args.member.toLowerCase(), chainId, reputation: args.newRep
//       }, blockNumber, logIndex)
//       break

//     case "IsAvailableReviewer":
//       console.log("Alchemy Webhook IsAvailableReviewer")
//       await upsertMember(mId(args.reviewer), {
//         address: args.reviewer.toLowerCase(), chainId,
//         isAvailable: args.isAvailable,
//         activeReviewsCount: Number(args.newActiveReviews)
//       }, blockNumber, logIndex)
//       break

//     case "RewardMember":
//       console.log("Alchemy Webhook RewardMember")
//       // COUNTER: Only increment if this block is newer than last recorded block
//       await db.update(member)
//         .set({ rewardsCount: sql`${member.rewardsCount} + 1`, updatedAt: new Date() })
//         .where(and(eq(member.id, mId(args.member)), versionCheck(member, blockNumber, logIndex)))
//       break

//     case "SlashMember":
//       console.log("Alchemy Webhook SlashMember")
//       await db.update(member)
//         .set({ slashesCount: sql`${member.slashesCount} + 1`, updatedAt: new Date() })
//         .where(and(eq(member.id, mId(args.member)), versionCheck(member, blockNumber, logIndex)))
//       break

//     // --- PUBLICATION STATE ---
//     case "SubmitPublication": {
//       console.log("Alchemy Webhook SubmitPublication")
//       const pubId = args.pubId
//       const cid = args.cid
//       await upsertPublication(pId(pubId), {
//         pubId,
//         chainId,
//         publisher: args.publisher.toLowerCase(),
//         cid,
//         paidSubmissionFee: args.paidFee,
//         status: 0, // SUBMITTED
//       }, blockNumber, logIndex)

//       // TRIGGER AI SUBMISSION AGENT
//       startSubmissionAgent({
//         publicationId: pubId.toString(),
//         rootCid: cid,
//         network: ChainIdToNetwork[chainId]
//       }).then(() => {
//         console.log(`✅ Started Submission Agent Analysis for Pub #${pubId.toString()}`)
//       }).catch(err => {
//         console.error(`❌ Starting Submission Agent failed for Pub #${pubId.toString()}:`, err)
//       })
//       break
//     }

//     case "LockedStakeOnPubId":
//       console.log("Alchemy Webhook LockedStakeOnPubId")
//       await upsertPublication(pId(args.pubId), { lockedStake: args.newLockedStake }, blockNumber, logIndex)
//       break

//     case "NewPublicationStatus":
//       console.log("Alchemy Webhook NewPublicationStatus")
//       await upsertPublication(pId(args.pubId), { status: args.newStatus }, blockNumber, logIndex)
//       break

//     case "Agent_PickReviewers": {
//       console.log("Alchemy Webhook Agent_PickReviewers")
//       const pubId = args.pubId
//       const cid = args.cid
//       const reviewers = args.reviewers.map((a: string) => a.toLowerCase())
//       const seniorReviewer = args.seniorReviewer.toLowerCase()

//       await upsertPublication(pId(pubId), {
//         reviewers,
//         seniorReviewer,
//         status: 2, // IN_REVIEW
//       }, blockNumber, logIndex)

//       // TRIGGER AI REVIEW AGENT
//       startReviewersAgent({
//         publicationId: pubId.toString(),
//         rootCid: cid,
//         reviewers,
//         seniorReviewer,
//         network: ChainIdToNetwork[chainId]
//       }).then(() => {
//         console.log(`✅ Starting Reviewers Agent for Pub #${pubId.toString()}`)
//       }).catch(err => {
//         console.error(`❌ Starting Reviewers Agent failed for Pub #${pubId.toString()}:`, err)
//       })
//       break
//     }

//     case "Agent_RecordReview": {
//       console.log("Alchemy Webhook Agent_RecordReview")
//       const { member: reviewerMember, pubId } = args // Changed naming to avoid confusion with the 'member' table import

//       if (!reviewerMember || !pubId) {
//         console.error("Missing required args for RecordReview:", args)
//         break
//       }

//       const reviewerAddress = reviewerMember.toLowerCase()
//       const publicationId = pId(pubId)

//       await db.update(publication)
//         .set({
//           reviewersStatus: sql`${publication.reviewersStatus} || jsonb_build_object(${reviewerAddress}::text, true)`,
//           lastBlockNumber: blockNumber,
//           lastLogIndex: logIndex,
//           updatedAt: new Date()
//         })
//         .where(
//           and(
//             eq(publication.id, publicationId),
//             versionCheck(publication, blockNumber, logIndex)
//           )
//         )
//       break
//     }

//     case "Agent_FinalizePublication":
//       console.log("Alchemy Webhook Agent_FinalizePublication")
//       await upsertPublication(pId(args.pubId), {
//         verdictCid: args.verdictCid,
//         status: args.status,
//       }, blockNumber, logIndex)
//       break
//   }
// }

/** * OCC VERSION CHECK UTILITY
 */
// function versionCheck(table: any, blockNumber: bigint, logIndex: number) {
//   return sql`(${table.lastBlockNumber} < ${blockNumber}) OR (${table.lastBlockNumber} = ${blockNumber} AND ${table.lastLogIndex} < ${logIndex})`
// }

/** * VERSIONED UPSERT HELPERS
 */
// async function upsertMember(id: string, data: any, blockNumber: bigint, logIndex: number) {
//   await db.insert(member)
//     .values({ id, ...data, lastBlockNumber: blockNumber, lastLogIndex: logIndex })
//     .onConflictDoUpdate({
//       target: member.id,
//       set: { ...data, lastBlockNumber: blockNumber, lastLogIndex: logIndex, updatedAt: new Date() },
//       where: versionCheck(member, blockNumber, logIndex)
//     })
// }

// async function upsertPublication(id: string, data: any, blockNumber: bigint, logIndex: number) {
//   await db.insert(publication)
//     .values({ id, ...data, lastBlockNumber: blockNumber, lastLogIndex: logIndex })
//     .onConflictDoUpdate({
//       target: publication.id,
//       set: { ...data, lastBlockNumber: blockNumber, lastLogIndex: logIndex, updatedAt: new Date() },
//       where: versionCheck(publication, blockNumber, logIndex)
//     })
// }

// async function upsertProtocol(chainId: number, data: any, blockNumber: bigint, logIndex: number) {
//   const id = chainId.toString()

//   // We assume the protocol row ALREADY EXISTS (created via seed).
//   // Therefore, webhooks should only UPDATE the pools.
//   await db.update(protocol)
//     .set({
//       ...data,
//       lastBlockNumber: blockNumber,
//       lastLogIndex: logIndex,
//       updatedAt: new Date()
//     })
//     .where(
//       and(
//         eq(protocol.id, id),
//         versionCheck(protocol, blockNumber, logIndex)
//       )
//     )
// }