"use client"

import { Protocol } from "@packages/schema"
import { useQuery } from "@tanstack/react-query"
import { getProtocolByChain } from "../../../_api/queries"
import { protocolsKeys } from "../query-keys/protocols-keys"

type Params = {
  initialData?: Protocol | null
  chainId?: number | null
}

export const useProtocolByChain = (params: Params) => {
  const { initialData, chainId } = params

  return useQuery<Protocol | null, Error>({

    queryKey: protocolsKeys.byChain(chainId ?? 0),
    queryFn: () => getProtocolByChain({ chainId: chainId ?? null }),
    initialData,
    enabled: !!chainId
  })
}