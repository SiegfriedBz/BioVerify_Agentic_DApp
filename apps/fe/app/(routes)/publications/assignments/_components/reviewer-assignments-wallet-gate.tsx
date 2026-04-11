"use client"

import type { FC } from "react"
import { useAuthFromWallet } from "@/_hooks/use-auth-from-wallet"
import { ReviewerAssignmentsContainer } from "./reviewer-assignments-container"
import { ReviewerGuestState } from "./reviewer-guest-state"
import { ReviewerStatsContainer } from "./reviewer-stats-container"

type Props = {
	server: {
		userAddress: string | null
		chainId: number | null
	}
}

export const ReviewerAssignmentsWalletGate: FC<Props> = (props) => {
	const { server } = props
	const { walletAddress, walletChainId } = useAuthFromWallet()

	const resolvedAddress = walletAddress ?? server.userAddress
	const activeAddress = resolvedAddress ? resolvedAddress.toLowerCase() : ""
	const activeChainId = walletChainId ?? server.chainId

	if (!activeAddress || activeChainId == null) {
		return <ReviewerGuestState />
	}

	return (
		<div className="space-y-12">
			<ReviewerStatsContainer
				activeAddress={activeAddress}
				activeChainId={activeChainId}
			/>
			<ReviewerAssignmentsContainer
				activeAddress={activeAddress}
				activeChainId={activeChainId}
			/>
		</div>
	)
}
