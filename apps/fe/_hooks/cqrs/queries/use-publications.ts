"use client"

import type { PublicationsResponse } from "@packages/schema"
import { useQuery } from "@tanstack/react-query"
import {
	getPublications,
	type PublicationsQueryParams,
} from "../../../_api/queries"
import { publicationsKeys } from "../query-keys/publications-keys"

type Props = {
	initialData?: PublicationsResponse
	searchQueryParams?: PublicationsQueryParams
}

export const usePublications = (props: Props) => {
	const {
		initialData = { items: [], totalCount: 0 },
		searchQueryParams = { limit: 10, offset: 0 },
	} = props

	const { data, isFetching, isError, refetch } = useQuery({
		queryKey: publicationsKeys.byQueryParams(searchQueryParams),
		queryFn: () => getPublications(searchQueryParams),
		initialData,
	})

	return { data, isFetching, isError, refetch }
}
