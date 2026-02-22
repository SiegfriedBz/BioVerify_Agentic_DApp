"use client"

import { useConnection, useReadContract } from "wagmi"
import { MappedProtocolReviewerAssignment, ProtocolReviewerAssignmentMapper } from "../_schemas/mappers/protoccol-reviewer-assignmement-mapper"
import { ProtocolReviewerAssignment } from "../_schemas/schemas/contract/protoccol-reviewer-assignmement"
import { useContractConfig } from "./use-contract-config"

type Return = {
	assignments: MappedProtocolReviewerAssignment[]
	isLoading: boolean
	isError: boolean
}

type Params = {
	mounted: boolean
}

export const useReviewerAssignments = (params: Params): Return => {
	const { mounted } = params

	const connection = useConnection()
	const contractConfig = useContractConfig()

	const { data, isLoading, isError, error, isFetched } = useReadContract({
		...contractConfig,
		functionName: 'getReviewerAssignments',
		args: [connection.address],
		query: {
			enabled: mounted || !!connection?.address,
			staleTime: 0,
		}
	})

	if (error) {
		console.error("useReviewerAssignments Error: ", error)
		return { assignments: [], isLoading, isError }
	}

	if (!isFetched || !data) return { assignments: [], isLoading, isError }

	const result = data as unknown as ProtocolReviewerAssignment[]

	const assignments = result?.
		map(res => {
			return ProtocolReviewerAssignmentMapper({ ...res, address: connection.address as `0x${string}` })
		}) ?? []

	return {
		assignments, isLoading, isError
	}
}