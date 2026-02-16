"use client"

import { useMemo } from "react"

import { NetworkSchema, NetworkT } from "../_schemas/network"
import { useCurrentChain } from "./use-current-chain"

export const useNetwork = (): NetworkT => {
	const currentChain = useCurrentChain()

	return useMemo(() => {
		const isSepolia =
			currentChain?.name?.toLowerCase() === NetworkSchema.enum.sepolia

		return isSepolia ? NetworkSchema.enum.sepolia : NetworkSchema.enum.sei_testnet
	}, [currentChain])
}

