"use client"

import { type Publication, PublicationStatusSchema } from "@packages/schema"
import { useQuery } from "@tanstack/react-query"
import { getPublicationById } from "../../../_api/queries"
import { publicationsKeys } from "../query-keys/publications-keys"

type Params = {
	initialData: Publication
	id: string // "chainId-pubId"
}

export const usePublicationDetail = (params: Params) => {
	const { initialData, id } = params

	const { data, isFetching, isError, refetch } = useQuery({
		queryKey: publicationsKeys.detail(id),
		queryFn: () => getPublicationById({ id }),
		initialData,
		enabled: !!id,

		// Smart Polling: Only poll every 10s if the publication is NOT finalized
		// (WebSocket handles NewPublicationStatus; polling covers Agent_PickReviewers)
		refetchInterval: (query) => {
			const status = query.state.data?.status
			const isFinalized =
				status === PublicationStatusSchema.enum.PUBLISHED ||
				status === PublicationStatusSchema.enum.SLASHED ||
				status === PublicationStatusSchema.enum.EARLY_SLASHED

			return isFinalized ? false : 10_000
		},
	})

	return { data, isFetching, isError, refetch }
}
