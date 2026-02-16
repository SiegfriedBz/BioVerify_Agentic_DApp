"use client"

import { useCallback } from "react"
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { useContractConfig } from "./use-contract-config"

export const usePayReviewerStake = () => {
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

