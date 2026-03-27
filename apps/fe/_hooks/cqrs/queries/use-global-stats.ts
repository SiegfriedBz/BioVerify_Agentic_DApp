"use client"

import { useQuery } from "@tanstack/react-query"
import { type GlobalAggregateStats, getStatsGlobal } from "../../../_api/queries"
import { statsKeys } from "../query-keys/stats-keys"

type Params = {
  initialData?: GlobalAggregateStats
}

export const useGlobalStats = (params: Params) => {
  const { initialData } = params

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: statsKeys.all,
    queryFn: () => getStatsGlobal(),
    initialData,
  })

  return { data, isFetching, isError, refetch }
}