"use client"

import { NetworkSchema, NetworkT } from "@packages/schema"
import { NetworkToChainId } from "@packages/utils"
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react"
import { useMemo } from "react"

export const useNetwork = (): NetworkT | "unknown" => {
	const { isConnected } = useAppKitAccount()
	const { caipNetwork } = useAppKitNetwork()

	return useMemo(() => {
		if (!isConnected || !caipNetwork) return "unknown"

		const chainId = Number(caipNetwork.id) // AppKit IDs are often strings like "eip155:84532"

		if (chainId === NetworkToChainId[NetworkSchema.enum.base_sepolia]) {
			return NetworkSchema.enum.base_sepolia
		}

		if (chainId === NetworkToChainId[NetworkSchema.enum.eth_sepolia]) {
			return NetworkSchema.enum.eth_sepolia
		}

		return "unknown"
	}, [isConnected, caipNetwork])
}