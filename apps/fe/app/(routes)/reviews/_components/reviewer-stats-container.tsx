"use client"

import { useMemberByChain } from "@/_hooks/cqrs/queries/use-member-by-chain"
import { useAuthFromWallet } from "@/_hooks/use-auth-from-wallet"
import { FetchError } from "@/app/_components/fetch-error"
import { Member } from "@packages/schema"
import { FC } from "react"
import { PayReviewerStakeButton } from "./pay-reviewer-stake-button"
import { ReviewerStatsCards } from "./reviewer-stats-cards"

type Props = {
  server: {
    initialData: Member
    chainId: number
    userAddress: string
  }
}

export const ReviewerStatsContainer: FC<Props> = (props) => {
  const { server } = props

  // 1. Get the actual active address & chain from the wallet
  const { walletAddress, walletChainId } = useAuthFromWallet()

  // 2. Use the wallet address & chain if available, otherwise fallback to the server values
  const activeAddress = walletAddress || server.userAddress
  const activeChainId = walletChainId || server.chainId

  // Only pass initialData to useQuery if the address & chain matches.
  // Otherwise, useQuery will be 'pending' correctly when we switch chains.
  const validatedInitialData =
    activeChainId === server.initialData?.chainId &&
      activeAddress.toLowerCase() === server.userAddress.toLowerCase()
      ? server.initialData
      : undefined

  // 3. Pass the ACTIVE address & chain to useQuery
  const { data: memberData, isFetching, isError, refetch: refetchMemberByChain } = useMemberByChain({ initialData: validatedInitialData, userAddress: activeAddress, chainId: activeChainId })

  if (isError) return <FetchError refetch={refetchMemberByChain} />

  if (isFetching && !memberData) {
    return <div className="h-30 w-full animate-pulse bg-muted" />
  }

  // 1. NON-MEMBER (Registration Flow)
  if (!memberData) {
    return (
      <div className="p-8 border border-dashed rounded-xl bg-muted/10 flex flex-col items-center gap-4 text-center">
        <div className="space-y-1">
          <h3 className="font-bold text-lg">Join the Protocol</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Stake ETH to become a verified reviewer and start earning rewards.
          </p>
        </div>
        <PayReviewerStakeButton
          size="lg" className="font-bold uppercase tracking-tight">
          Register as Reviewer
        </PayReviewerStakeButton>
      </div>
    )
  }

  // 2. MEMBER STATE (Always show cards, conditionally show warning/top-up)
  return (
    <div className="space-y-6">
      {/* Availability Alert */}
      {!memberData.isAvailable && (
        <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-amber-500">Ineligible for Reviews</p>
            <p className="text-xs text-amber-200/70">
              Your available stake is below the requirement. Top up to join the active pool.
            </p>
          </div>
          <PayReviewerStakeButton
            variant="outline" size="sm" className="border-amber-500/50 text-amber-500 hover:bg-amber-500/20">
            Top Up Stake
          </PayReviewerStakeButton>
        </div>
      )}

      {/* Stats Cards - Always Visible for Members */}
      <ReviewerStatsCards member={memberData} isSyncing={isFetching} />

      {/* Member-only Action: Top Up (Visible even if already available) */}
      {memberData.isAvailable && (
        <div className="flex justify-end">
          <PayReviewerStakeButton
            variant="ghost" size="sm" className="text-xs font-bold uppercase opacity-50 hover:opacity-100">
            + Increase Stake
          </PayReviewerStakeButton>
        </div>
      )}
    </div>
  )
}
