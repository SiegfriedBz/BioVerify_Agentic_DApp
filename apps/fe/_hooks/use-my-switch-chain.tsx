"use client"

import { NetworkSchema } from "@packages/schema"
import { ChainIdToNetwork, NetworkToChainId } from "@packages/utils"
import { useCallback, useMemo } from "react"
import {
	type UseConnectionsReturnType,
	useConnections,
	useSwitchChain,
} from "wagmi"

export const useMySwitchChain = () => {
	const { mutate } = useSwitchChain()

	const connections: UseConnectionsReturnType = useConnections()
	const connection = connections?.at(0)
	const chainId = connection?.chainId

	const network = chainId ? ChainIdToNetwork[chainId] : undefined

	const nextNetwork = useMemo(() => {
		return network === NetworkSchema.enum.base_sepolia
			? NetworkSchema.enum.eth_sepolia
			: NetworkSchema.enum.base_sepolia
	}, [network])

	const onSwitch = useCallback(() => {
		mutate({ chainId: NetworkToChainId[nextNetwork] })
	}, [mutate, nextNetwork])

	return { onSwitch, currentNetwork: network, nextNetwork }
}
