"use client"

import { useCallback } from "react"
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { useContractConfig } from "./use-contract-config"

type SubmitPublicationParams = {
	cid: string
	totalWeiValue: bigint // total wei value sent (stake + submission fee)
	submissionFeeWeiValue: bigint // effective submissionFee wei value
}

export const useSubmitPublication = () => {
	const { data: hash, error, isPending, writeContract } = useWriteContract()
	const { isLoading: isConfirming, isSuccess: isConfirmed } =
		useWaitForTransactionReceipt({
			hash,
		})

	const contractConfig = useContractConfig()

	const submitPublication = useCallback(
		(params: SubmitPublicationParams) => {
			const { cid, totalWeiValue, submissionFeeWeiValue } = params

			return writeContract({
				...contractConfig,
				functionName: "submitPublication",
				args: [cid, submissionFeeWeiValue],
				value: totalWeiValue,
			})
		},
		[writeContract, contractConfig],
	)

	return {
		submitPublication,
		hash,
		error,
		isPending,
		isConfirming,
		isConfirmed,
	}
}
