"use client"

import { useQuery } from "@tanstack/react-query"
import {
	getMemberAssignments,
	type MemberAssignments,
} from "../../../_api/queries"
import { assignmentKeys } from "../query-keys/assignments-keys"

type Params = {
	initialData?: MemberAssignments
	userAddress: string
}

export const useMemberAssignments = (params: Params) => {
	const { initialData, userAddress } = params

	const { data, isFetching, isError, refetch } = useQuery({
		queryKey: assignmentKeys.byUser(userAddress.toLowerCase()),
		queryFn: () =>
			getMemberAssignments({
				userAddress,
			}),
		initialData,
		enabled: !!userAddress,
	})

	return { data, isFetching, isError, refetch }
}
