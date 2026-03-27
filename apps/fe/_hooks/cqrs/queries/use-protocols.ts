"use client"

import { Protocol } from "@packages/schema"
import { useQuery } from "@tanstack/react-query"
import { getProtocols } from "../../../_api/queries"
import { protocolsKeys } from "../query-keys/protocols-keys"

type Params = {
  initialData?: Protocol[]
}

export const useProtocols = (params: Params = {}) => {
  const { initialData = [] } = params

  const { data, isFetching, isError } = useQuery({
    queryKey: protocolsKeys.all,
    queryFn: () => getProtocols(),
    initialData
  })

  return { data, isFetching, isError }
}