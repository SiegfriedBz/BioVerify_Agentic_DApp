import { env } from "@packages/env"
import { protocolDbSchema } from '@packages/schema/db'
import { NetworkToChainId } from "@packages/utils"
import "server-only"
import { db } from ".."

const constants = {
  aiAgent: env.AI_AGENT_ADDRESS.toLowerCase(),
  treasury: env.TREASURY_ADDRESS.toLowerCase(),
  vrfNumWords: env.VRF_NUM_WORDS,
  deployValue: BigInt(env.DEPLOY_VALUE),
  reputationBoost: BigInt(env.REPUTATION_BOOST),
  publisherMinFee: BigInt(env.PUBLISHER_MIN_FEE),
  publisherStake: BigInt(env.PUBLISHER_STAKE),
  reviewerStake: BigInt(env.REVIEWER_STAKE),
  reviewerReward: BigInt(env.REVIEWER_REWARD)
}

async function seed() {
  const chains = [
    { id: NetworkToChainId.base_sepolia },
    { id: NetworkToChainId.eth_sepolia }
  ]

  for (const chain of chains) {
    await db.insert(protocolDbSchema).values({
      id: chain.id.toString(),
      chainId: chain.id,
      rewardPool: constants.deployValue,
      slashPool: 0n,
      aiAgent: constants.aiAgent,
      treasury: constants.treasury,
      vrfNumWords: constants.vrfNumWords,
      reputationBoost: constants.reputationBoost,
      publisherMinFee: constants.publisherMinFee,
      publisherStake: constants.publisherStake,
      reviewerStake: constants.reviewerStake,
      reviewerReward: constants.reviewerReward,

      lastBlockNumber: 0n, // Placeholder
      lastLogIndex: 0
    }).onConflictDoUpdate({
      target: protocolDbSchema.id,
      set: {
        aiAgent: constants.aiAgent,
        treasury: constants.treasury,
        reputationBoost: constants.reputationBoost,
        publisherMinFee: constants.publisherMinFee,
        publisherStake: constants.publisherStake,
        reviewerStake: constants.reviewerStake,
        reviewerReward: constants.reviewerReward,
        updatedAt: new Date()
      }
    })
  }
}

seed()
  .then(() => {
    console.log("✅ Protocol state initialized")
    process.exit(0)
  })
  .catch((err) => {
    console.error("❌ Seeding failed:", err)
    process.exit(1)
  })