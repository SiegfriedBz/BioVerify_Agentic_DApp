"use client"

import { useCallback } from "react"
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { useContractConfig } from "./use-contract-config"

type Params = {
	minStake: bigint
}

export const usePayReviewerStake = (params: Params) => {
	const { minStake } = params

	const { data: hash, error, isPending, writeContract } = useWriteContract()
	const { isLoading: isConfirming, isSuccess: isConfirmed } =
		useWaitForTransactionReceipt({
			hash,
		})

	const contractConfig = useContractConfig()

	const payReviewerStake = useCallback(
		() => {
			return writeContract({
				...contractConfig,
				functionName: "payReviewerStake",
				value: minStake
			})
		},
		[writeContract, contractConfig],
	)

	return {
		payReviewerStake,
		hash,
		error,
		isPending,
		isConfirming,
		isConfirmed,
	}
}

