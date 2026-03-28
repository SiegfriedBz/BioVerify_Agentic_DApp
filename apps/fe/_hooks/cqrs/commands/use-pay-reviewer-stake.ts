"use client"

import { reownConfig } from "@/_config/wagmi/wagmi-config"
import { Member } from "@packages/schema"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { waitForTransactionReceipt, writeContract } from "@wagmi/core"
import { toast } from "sonner"
import { formatEther, parseEther } from "viem"
import { useContractConfig } from "../../use-contract-config"
import { useProtocolByChain } from "../queries/use-protocol-by-chain"
import { membersKeys } from "../query-keys/members-keys"
import { statsKeys } from "../query-keys/stats-keys"

type Params = {
  chainId: number
  userAddress: string
}

export const usePayReviewerStake = (params: Params) => {
  const { chainId, userAddress } = params

  const queryClient = useQueryClient()
  const contractConfig = useContractConfig()

  const { data: protocolData } = useProtocolByChain({ chainId })
  const reviewerStake = protocolData?.reviewerStake ?? "0"

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!reviewerStake) {
        throw new Error("Protocol configuration is still loading or unavailable for this network.")
      }

      const hash = await writeContract(reownConfig, {
        ...contractConfig,
        functionName: "payReviewerStake",
        value: parseEther(reviewerStake),
      })

      toast.info("Transaction sent! Waiting for confirmation...")

      const receipt = await waitForTransactionReceipt(reownConfig, {
        hash
      })

      if (receipt.status === "reverted") {
        throw new Error("Transaction reverted by the EVM")
      }

      return receipt
    },
    onSuccess: async () => {
      toast.success("Stake deposited successfully!")

      // 1. Optimistically update the cache immediately
      queryClient.setQueryData(membersKeys.byChain(userAddress.toLowerCase(), chainId), (oldData: Member | undefined) => {
        if (!oldData) return oldData

        const currentStakeWei = parseEther(oldData.availableStake)
        const addedStakeWei = parseEther(reviewerStake)
        const totalStakeWei = currentStakeWei + addedStakeWei

        return {
          ...oldData,
          member: {
            ...oldData,
            availableStake: formatEther(totalStakeWei),
          }
        }
      })

      // 2. Schedule a background invalidation to ensure sync with the actual Neon DB
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: membersKeys.byChain(userAddress.toLowerCase(), chainId) })
        queryClient.invalidateQueries({ queryKey: statsKeys.byChain(chainId) })
      }, 3000)
    },
    onError: (err: any) => {
      console.error("Staking error:", err)
      toast.error(err.shortMessage || err.message || "Transaction failed")
    }
  })

  return {
    mutate,
    isPending
  }
}