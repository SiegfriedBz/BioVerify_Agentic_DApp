"use client"

import { useChainStats } from "@/_hooks/cqrs/queries/use-chain-stats"
import { useAuthFromWallet } from "@/_hooks/use-auth-from-wallet"
import { FetchError } from "@/app/_components/fetch-error"
import { MetricCard } from "@/app/_components/metric-card"
import type { ChainStats } from "@packages/cqrs"
import { useAppKitAccount } from "@reown/appkit/react"
import { LandmarkIcon, UsersIcon } from "lucide-react"
import { ChainStatsSkeleton } from "./chain-stats-skeleton"

type Props = {
	server: {
		chainId: number
		initialData: Awaited<ChainStats>
	}
}

export const ChainStatsContainer = (props: Props) => {
	const { server } = props
	const { isConnected } = useAppKitAccount()
	const { walletChainId } = useAuthFromWallet()
	const activeChainId = walletChainId || server.chainId

	const validatedInitialData =
		activeChainId === server.chainId ? server.initialData : undefined

	const {
		data: stats,
		isFetching,
		isError,
		refetch,
	} = useChainStats({
		chainId: activeChainId,
		initialData: validatedInitialData,
	})

	if (!isConnected) return null

	if (isError) return <FetchError refetch={refetch} />

	if (isFetching && !stats) {
		return <ChainStatsSkeleton />
	}

	if (!stats) return null

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
				{/* Reward Pool Card with requirement info */}
				<MetricCard
					label="Network Reward Pool"
					value={`${stats.rewardPool} ETH`}
					icon={LandmarkIcon}
					status={stats.isLiquidityMissing ? "error" : "default"}
					description={
						stats.isLiquidityMissing
							? `Insufficient Liquidity: Pool needs at least ${stats.minRewardPool} ETH to cover reviewer rewards.`
							: `Protocol ready (${stats.minRewardPool} ETH required)`
					}
				/>

				{/* Reviewer Card using the +1 logic */}
				<MetricCard
					label="Available Reviewers"
					value={`${stats.availableReviewersPoolSize} / ${stats.minReviewersPoolSize}`}
					icon={UsersIcon}
					status={
						stats.availableReviewersPoolSize < stats.minReviewersPoolSize
							? "error"
							: "default"
					}
					description={
						stats.availableReviewersPoolSize < stats.minReviewersPoolSize
							? `Insufficient Peer Count: Need ${stats.minReviewersPoolSize} active reviewers to ensure unbiased selection.`
							: "Reviewer pool is healthy"
					}
				/>
			</div>
		</div>
	)
}
