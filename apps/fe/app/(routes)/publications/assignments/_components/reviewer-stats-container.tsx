"use client"

import { useMemberByChain } from "@/_hooks/cqrs/queries/use-member-by-chain"
import { FetchError } from "@/app/_components/fetch-error"
import { NetworkBadge } from "@/app/_components/network-badge"
import { TypographySmall } from "@/app/_components/typography"
import { ChainIdToNetwork } from "@packages/utils"
import type { FC } from "react"
import { PayReviewerStakeButton } from "./pay-reviewer-stake-button"
import { ReviewerInsufficientStakeCard } from "./reviewer-insufficient-stake-card"
import { ReviewerJoinProtocolCard } from "./reviewer-join-protocol-card"
import { ReviewerStatsCards } from "./reviewer-stats-cards"

type Props = {
	activeAddress: string
	activeChainId: number
}

export const ReviewerStatsContainer: FC<Props> = (props) => {
	const { activeAddress, activeChainId } = props

	const {
		data: memberData,
		isFetching,
		isError,
		refetch: refetchMemberByChain,
	} = useMemberByChain({
		userAddress: activeAddress,
		chainId: activeChainId,
	})

	if (isError) return <FetchError refetch={refetchMemberByChain} />

	if (isFetching && !memberData) {
		return <div className="h-30 w-full animate-pulse bg-muted" />
	}

	const currentNetwork = ChainIdToNetwork[activeChainId]

	if (!memberData) {
		return <ReviewerJoinProtocolCard currentNetwork={currentNetwork} />
	}

	return (
		<div className="space-y-6">
			{!memberData.isAvailable && (
				<ReviewerInsufficientStakeCard currentNetwork={currentNetwork} />
			)}

			<ReviewerStatsCards member={memberData} isSyncing={isFetching} />

			{memberData.isAvailable && (
				<div className="flex min-w-0 flex-col gap-3 rounded-xl border border-border/40 bg-muted/20 px-4 py-3 @sm:flex-row @sm:items-center @sm:justify-between">
					<div className="flex min-w-0 flex-wrap items-center gap-2">
						<TypographySmall className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
							Staking on
						</TypographySmall>
						<NetworkBadge network={currentNetwork} />
					</div>
					<PayReviewerStakeButton
						size="sm"
						className="cursor-pointer bg-primary font-semibold tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
					>
						Top up stake
					</PayReviewerStakeButton>
				</div>
			)}
		</div>
	)
}
