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

	const payReviewerMinStake = useCallback(
		() => {
			return writeContract({
				...contractConfig,
				functionName: "payReviewerMinStake",
				value: minStake
			})
		},
		[writeContract, contractConfig],
	)

	return {
		payReviewerMinStake,
		hash,
		error,
		isPending,
		isConfirming,
		isConfirmed,
	}
}

