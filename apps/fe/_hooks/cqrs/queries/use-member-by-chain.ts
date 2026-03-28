"use client"

import { Member } from "@packages/schema"
import { useQuery } from "@tanstack/react-query"
import { getMemberByChain } from "../../../_api/queries"
import { membersKeys } from "../query-keys/members-keys"
import { statsKeys } from "../query-keys/stats-keys"

type Params = {
  initialData?: Member
  userAddress: string
  chainId: number
}

export const useMemberByChain = (params: Params) => {
  const {
    initialData,
    userAddress,
    chainId } = params

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [
      ...membersKeys.byChain(userAddress.toLowerCase(), chainId),
      ...statsKeys.byChain(chainId)
    ],
    queryFn: () => getMemberByChain({
      userAddress,
      chainId
    }),
    initialData,
    enabled: !!userAddress && !!chainId
  })

  return { data, isFetching, isError, refetch }
}