"use client"

import { useMemo } from "react"
import {
	bioVerifyContractConfig,
	type ContractConfig,
} from "../_contracts/config"
import { NetworkSchema } from "../_schemas/wallet"
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

