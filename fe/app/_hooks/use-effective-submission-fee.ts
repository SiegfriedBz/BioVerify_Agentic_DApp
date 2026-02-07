"use client"

import { useMemo } from "react"
import { useReadContract } from "wagmi"
import { useContractConfig } from "./use-contract-config"
import { useEstimatedVrfFee } from "./use-estimated-vrf-fee"

export const useEffectiveSubmissionFee = () => {
	const contractConfig = useContractConfig()

	// 1. fetch current estimated VRF fee
	const { estimatedVrfFeeWei } = useEstimatedVrfFee()

	// 2. Fetch Publication Submission Fee
	const { data: minSubmissionFeeWei } = useReadContract({
		...contractConfig,
		functionName: "I_PUBLISHER_MIN_FEE",
	})

	// 3. The "Effective Fee" is the higher of the ( minSubmissionFeeWei, estimatedVrfFeeWei )
	const effectiveSubmissionFeeWei = useMemo(() => {
		if (!minSubmissionFeeWei) return estimatedVrfFeeWei

		return estimatedVrfFeeWei > (minSubmissionFeeWei as bigint)
			? estimatedVrfFeeWei
			: (minSubmissionFeeWei as bigint)
	}, [minSubmissionFeeWei, estimatedVrfFeeWei])

	return { effectiveSubmissionFeeWei }
}