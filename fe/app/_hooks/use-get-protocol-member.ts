"use client"

import { ProtocolMember } from "@/lib/protocol/schemas/protocol-member"
import { useConnection, useReadContract } from "wagmi"
import { useContractConfig } from "./use-contract-config"

type StructMember =
	[
		`0x${string}`,    // memberAddress
		bigint,    				// stakes
		bigint[],  				// publishedPublicationsIds
		boolean,   				// isReviewer (bool)
		bigint     				// reputation
	]

export const useGetProtocolMember = (): ProtocolMember | null => {
	const connection = useConnection()
	const contractConfig = useContractConfig()

	const { data } = useReadContract({
		...contractConfig,
		functionName: 'addressToMember',
		args: [connection.address],
		query: { enabled: !!connection?.address }
	})

	const result = data as unknown as StructMember

	if (!result) return null

	return {
		memberAddress: result[0],
		stakes: result[1],
		publishedPublicationsIds: result[2],
		isReviewer: result[3],
		reputation: result[4],
	}
}