"use client"

import { NetworkSchema } from "@packages/schema"
import { BioVerifyContractConfig, ContractConfig, NetworkToChainId } from "@packages/utils"
import { useMemo } from "react"
import { useChainId } from "wagmi"

export const useContractConfig = (): ContractConfig => {
	const chainId = useChainId()

	return useMemo(() => {
		const isBaseSepolia = chainId === NetworkToChainId[NetworkSchema.enum.base_sepolia]

		const networkKey = isBaseSepolia
			? NetworkSchema.enum.base_sepolia
			: NetworkSchema.enum.eth_sepolia

		return BioVerifyContractConfig[networkKey]
	}, [chainId])
}