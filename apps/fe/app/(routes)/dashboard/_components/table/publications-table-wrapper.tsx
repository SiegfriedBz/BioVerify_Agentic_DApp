
import { getPublications } from "@packages/cqrs"
import { getStatusAsNumber, PublicationsResponse, PublicationStatus } from "@packages/schema"
import { FC } from "react"
import { searchParamsCache } from "../../search-params"
import { PublicationsTableContainer } from "./publications-table-container"

export const PublicationsTableWrapper: FC = async () => {
  const { pageIndex, pageSize, filters } = searchParamsCache.all()

  const chainIdFilter = filters.find(f => f.id === 'chainId')?.value
  const statusFilter = (filters.find(f => f.id === 'status')?.value) as PublicationStatus ?? undefined

  const searchQueryParams = {
    limit: pageSize,
    offset: pageIndex * pageSize,
    chainId: chainIdFilter ? Number(chainIdFilter) : undefined,
    status: statusFilter ? getStatusAsNumber(statusFilter) : undefined
  }
  const data: PublicationsResponse = await getPublications(searchQueryParams)

  return <PublicationsTableContainer
    initialData={data}
    searchQueryParams={searchQueryParams}
  />
}