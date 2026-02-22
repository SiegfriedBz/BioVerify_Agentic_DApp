"use client"

import { useMemo } from "react"
import { ContractConfig } from "../_config/contracts/constants"
import { bioVerifyContractConfig } from "../_config/contracts/contract-config"
import { NetworkSchema } from "../_schemas/schemas/network"
import { useCurrentChain } from "./use-current-chain"

/**
 * @returns ContractConfig - BioVerify contract address & abi for current chain
 */
export const useContractConfig = (): ContractConfig => {
	const currentChain = useCurrentChain()

	return useMemo(() => {
		const isSepolia =
			currentChain?.name?.toLowerCase() === NetworkSchema.enum.sepolia

		return bioVerifyContractConfig[
			isSepolia ? NetworkSchema.enum.sepolia : NetworkSchema.enum.sei_testnet
		]
	}, [currentChain])
}

