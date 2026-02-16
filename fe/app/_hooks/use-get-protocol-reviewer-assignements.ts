"use client"

import { ProtocolReviewerAssignment } from "@/lib/protocol/schemas/protoccol-reviewer-assignmement"
import { useConnection, useReadContract } from "wagmi"
import { useContractConfig } from "./use-contract-config"

type Return = {
	assignments: ProtocolReviewerAssignment[]
	isLoading: boolean
	isError: boolean
}


export const useGetProtocolReviewerAssignments = (): Return => {
	const connection = useConnection()
	const contractConfig = useContractConfig()

	const { data, isLoading, isError } = useReadContract({
		...contractConfig,
		functionName: 'getReviewerAssignments',
		args: [connection.address],
		query: { enabled: !!connection?.address }
	})

	const result = data as unknown as ProtocolReviewerAssignment[]

	return { assignments: result ?? [], isLoading, isError }
}