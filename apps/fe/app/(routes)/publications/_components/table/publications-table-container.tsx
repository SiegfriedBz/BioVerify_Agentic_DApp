"use client"

import { usePublications } from "@/_hooks/cqrs/queries/use-publications"
import { FetchError } from "@/app/_components/fetch-error"
import type { PublicationsQueryParams } from "@packages/cqrs"
import type { PublicationsResponse } from "@packages/schema"
import { PublicationsTableSkeleton } from "../publications-table-skeleton"
import { PublicationsTable } from "./publications-table"

type Props = {
	initialData: PublicationsResponse
	searchQueryParams?: PublicationsQueryParams
}

export const PublicationsTableContainer = (props: Props) => {
	const { initialData, searchQueryParams } = props

	const {
		data: publicationsResponse,
		isFetching,
		isError,
		refetch,
	} = usePublications({ initialData, searchQueryParams })

	if (isError) return <FetchError refetch={refetch} />

	if (isFetching && !publicationsResponse) {
		return <PublicationsTableSkeleton />
	}

	if (!publicationsResponse) return null

	const publications = publicationsResponse.items ?? []
	const count = publicationsResponse.totalCount ?? 0

	return <PublicationsTable publications={publications} count={count} />
}
