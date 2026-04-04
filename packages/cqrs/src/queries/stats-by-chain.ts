import { db } from "@packages/db"
import { memberDbSchema } from "@packages/schema"
import { and, count, eq } from "drizzle-orm"
import { formatEther, parseEther } from "viem"
import { getProtocolByChain } from "./protocol-by-chain"

export type ChainStats = {
	minRewardPool: string
	rewardPool: string
	minReviewersPoolSize: number
	availableReviewersPoolSize: number
	isLiquidityMissing: boolean
	isPoolStalled: boolean
	chainId: number
} | null

/**
 * Computes stats for a specific chain.
 */
export async function getStatsByChain(params: {
	chainId: number
}): Promise<ChainStats> {
	const { chainId } = params

	try {
		// 1. Fetch protocol config and count available reviewers
		const [protocol, [memberCountRes]] = await Promise.all([
			getProtocolByChain({ chainId }),
			db
				.select({ value: count() })
				.from(memberDbSchema)
				.where(
					and(
						eq(memberDbSchema.chainId, chainId),
						eq(memberDbSchema.isAvailable, true),
					),
				),
		])

		if (!protocol) return null

		// 2. Logic: Minimum Liquidity Requirement
		const reviewerRewardWei = parseEther(protocol.reviewerReward)
		const minRewardPoolWei = BigInt(protocol.vrfNumWords) * reviewerRewardWei
		const currentRewardPoolWei = parseEther(protocol.rewardPool)

		// 3. Logic: Reviewer Pool Sufficiency
		// Protocol requires vrfNumWords + 1 (to prevent the publisher to self-review)
		const minReviewersRequired = protocol.vrfNumWords + 1
		const availableReviewers = memberCountRes.value

		const isLiquidityMissing = currentRewardPoolWei < minRewardPoolWei
		const isPoolStalledByCount = availableReviewers < minReviewersRequired

		return {
			minRewardPool: formatEther(minRewardPoolWei),
			rewardPool: protocol.rewardPool,
			minReviewersPoolSize: minReviewersRequired,
			availableReviewersPoolSize: availableReviewers,
			isLiquidityMissing,
			isPoolStalled: isPoolStalledByCount || isLiquidityMissing,
			chainId,
		}
	} catch (error) {
		console.error(`[CQRS] getStatsByChain Failed for chain ${chainId}:`, error)
		return null
	}
}
