"use client"

import { useConnection, useReadContract } from "wagmi"
import { ProtocolMember } from "../_schemas/schemas/contract/protocol-member"
import { useContractConfig } from "./use-contract-config"

type Params = {
	mounted: boolean
}

export const useMemberDetails = (params: Params): ProtocolMember | null => {
	const { mounted } = params

	const connection = useConnection()
	const contractConfig = useContractConfig()

	const { data, error, isFetched } = useReadContract({
		...contractConfig,
		functionName: 'getMember',
		args: [connection.address as `0x${string}`],
		query: {
			enabled: mounted || !!connection?.address,
			staleTime: 0,
		}
	})

	if (error) {
		console.error("useMemberDetails Error: ", error)
		return null
	}

	if (!isFetched || !data) return null

	return data as unknown as ProtocolMember
}