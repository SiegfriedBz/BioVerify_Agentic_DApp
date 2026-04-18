"use client"

import type { MemberAssignmentsResponse } from "@packages/cqrs"
import { useQuery } from "@tanstack/react-query"
import { getMemberAssignments } from "../../../_api/queries"
import { assignmentKeys } from "../query-keys/assignments-keys"

type Params = {
	initialData?: MemberAssignmentsResponse
	userAddress: string
}

export const useMemberAssignments = (params: Params) => {
	const { initialData, userAddress } = params

	const { data, isFetching, isError, refetch } = useQuery({
		queryKey: assignmentKeys.byUser(userAddress.toLowerCase()),
		queryFn: () => getMemberAssignments({ userAddress }),
		initialData,
		enabled: !!userAddress,
	})

	return { data, isFetching, isError, refetch }
}
