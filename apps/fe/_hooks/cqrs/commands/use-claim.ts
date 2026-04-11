"use client"

import type { Member } from "@packages/schema"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { waitForTransactionReceipt, writeContract } from "@wagmi/core"
import { toast } from "sonner"
import { formatEther, parseEther } from "viem"
import { reownConfig } from "@/_config/wagmi/wagmi-config"
import { useContractConfig } from "../../use-contract-config"
import { membersKeys } from "../query-keys/members-keys"
import { statsKeys } from "../query-keys/stats-keys"

type ClaimArgs = {
	amountWei: bigint
}

type Params = {
	chainId: number
	userAddress: string
}

export const useClaim = (params: Params) => {
	const { chainId, userAddress } = params

	const queryClient = useQueryClient()
	const contractConfig = useContractConfig()

	const { mutate, isPending } = useMutation({
		mutationFn: async (args: ClaimArgs) => {
			const { amountWei } = args

			// Trigger Wallet
			const hash = await writeContract(reownConfig, {
				...contractConfig,
				functionName: "claim",
				args: [amountWei],
			})

			toast.info("Transaction sent! Waiting for confirmation...")

			// Wait for Mining
			const receipt = await waitForTransactionReceipt(reownConfig, { hash })

			if (receipt.status === "reverted") throw new Error("Transaction reverted")

			return receipt
		},
		onSuccess: async (_data, variables) => {
			toast.success("Claim confirmed on ledger!")

			// 1. Optimistically update the cache immediately
			queryClient.setQueryData(
				membersKeys.byChain(userAddress.toLowerCase(), chainId),
				(oldData: Member | undefined) => {
					if (!oldData) return oldData

					const currentStakeWei = parseEther(oldData.availableStake)
					const claimedStakeWei = variables.amountWei
					const totalStakeWei =
						currentStakeWei > claimedStakeWei
							? currentStakeWei - claimedStakeWei
							: 0n

					return {
						...oldData,
						member: {
							...oldData,
							availableStake: formatEther(totalStakeWei),
						},
					}
				},
			)

			// 2. Schedule a background invalidation to ensure sync with the actual Neon DB
			setTimeout(() => {
				queryClient.invalidateQueries({
					queryKey: membersKeys.byChain(userAddress.toLowerCase(), chainId),
				})
				queryClient.invalidateQueries({ queryKey: statsKeys.byChain(chainId) })
			}, 3000)
		},
		onError: (err: Error) => {
			const shortMessage = (err as { shortMessage?: string }).shortMessage
			const message =
				shortMessage || err.message || "Claim Stake/Rewards failed"
			toast.error(message)
		},
	})

	return {
		mutate,
		isPending,
	}
}
