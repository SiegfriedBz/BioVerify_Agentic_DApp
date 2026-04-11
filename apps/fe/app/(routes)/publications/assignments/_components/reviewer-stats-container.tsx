"use client"

import { useMemberByChain } from "@/_hooks/cqrs/queries/use-member-by-chain"
import { FetchError } from "@/app/_components/fetch-error"
import { NetworkBadge } from "@/app/_components/network-badge"
import { TypographySmall } from "@/app/_components/typography"
import { ChainIdToNetwork } from "@packages/utils"
import type { FC } from "react"
import { ClaimDialog } from "./claim/claim-dialog"
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
				<div className="flex min-w-0 flex-col gap-3 rounded-xl border border-border/40 bg-muted/20 px-4 py-3 @md:flex-row @md:items-center @md:justify-between">
					<div className="flex min-w-0 items-center gap-2">
						<TypographySmall className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground whitespace-nowrap">
							Staking on
						</TypographySmall>
						<NetworkBadge network={currentNetwork} />
					</div>

					<div className="flex items-center @max-md:flex-col gap-6 @max-md:w-full">
						<PayReviewerStakeButton
							size="sm"
							variant="outline"
							className="cursor-pointer @max-md:w-full font-semibold tracking-wide text-primary transition-colors hover:bg-primary/90"
						>
							Top up stake
						</PayReviewerStakeButton>

						<ClaimDialog
							activeAddress={activeAddress}
							activeChainId={activeChainId}
						/>
					</div>
				</div>
			)}
		</div>
	)
}
