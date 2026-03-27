"use client"

import { useQuery } from "@tanstack/react-query"
import { type ChainStats, getStatsByChain } from "../../../_api/queries"
import { statsKeys } from "../query-keys/stats-keys"

type Params = {
  chainId: number
  initialData?: ChainStats
}

export const useChainStats = (params: Params) => {
  const { chainId, initialData } = params

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: statsKeys.byChain(chainId),
    queryFn: () => getStatsByChain({ chainId }),
    initialData,
    enabled: !!chainId,
  })

  return { data, isFetching, isError, refetch }
}