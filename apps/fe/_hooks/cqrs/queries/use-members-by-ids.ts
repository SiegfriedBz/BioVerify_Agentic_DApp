"use client"

import { PublicationStatus, PublicationStatusSchema } from "@packages/schema"
import { useQuery } from "@tanstack/react-query"
import { getMembersByIds } from "../../../_api/queries"
import { membersKeys } from "../query-keys/members-keys"

type Params = {
  ids: string[]
  publicationStatus: PublicationStatus
}

export const useMembersByIds = (params: Params) => {
  const { ids, publicationStatus } = params

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: membersKeys.byPublicationStatus(ids, publicationStatus),
    queryFn: () => getMembersByIds({ ids }),
    enabled: ids.length > 0,
    // Smart Polling: Only poll every 5s if the publication is NOT finalized
    refetchInterval: () => {
      const isFinalized = publicationStatus === PublicationStatusSchema.enum.PUBLISHED ||
        publicationStatus === PublicationStatusSchema.enum.SLASHED ||
        publicationStatus === PublicationStatusSchema.enum.EARLY_SLASHED

      return isFinalized ? false : 5_000 // Poll every 5s if pending
    }
  })

  return { data, isFetching, isError, refetch }
}