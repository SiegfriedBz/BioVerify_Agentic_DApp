"use client"

import { env } from "@packages/env"
import { useMemo } from "react"
import { useGasPrice } from "wagmi"

// Estimate for VRF request + fulfillment
const ESTIMATED_VRF_GAS_UNITS = BigInt(
	env.NEXT_PUBLIC_ESTIMATED_VRF_GAS_UNITS || "1000000",
)

export const useEstimatedVrfFee = () => {
	// 1. Fetch current gas price from Wagmi/Viem
	const { data: gasPrice } = useGasPrice()

	// 2. Estimate VRF Cost (Gas Price * Gas Units * 1.24 for Chainlink Premium by using ETH nativePayment)
	const estimatedVrfFeeWei = useMemo(() => {
		if (!gasPrice) return 0n

		return (gasPrice * ESTIMATED_VRF_GAS_UNITS * 124n) / 100n
	}, [gasPrice])

	return { estimatedVrfFeeWei }
}
