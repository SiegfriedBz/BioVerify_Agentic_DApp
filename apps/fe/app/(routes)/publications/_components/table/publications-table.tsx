"use client"

import type { Publication } from "@packages/schema"
import { NetworkToChainId } from "@packages/utils"
import { BookOpenTextIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { type FC, useCallback } from "react"
import { useDataTableUrlState } from "@/_hooks/use-data-table-url-state"
import {
	NetworkToMessage,
	networkOptions,
} from "@/app/_components/network-badge"
import { publicationStatusOptions } from "@/app/_components/publication-status-badge"
import {
	DataTableClearFilter,
	DataTableFacetedFilter,
	DataTablePagination,
	DataTableToolbarSection,
} from "@/components/niko-table/components"
import {
	DataTable,
	DataTableBody,
	DataTableEmptyBody,
	DataTableHeader,
	DataTableRoot,
} from "@/components/niko-table/core"
import { parsers } from "../../search-params"
import { columns } from "./columns"

type Props = {
	publications: Publication[]
	count: number
}

const chainOptions = networkOptions.map((op) => {
	return {
		value: `${NetworkToChainId[op.value]}`,
		label: NetworkToMessage[op.value],
	}
})

export const PublicationsTable: FC<Props> = (props) => {
	const { publications, count } = props
	const router = useRouter()

	const {
		urlState,
		onPaginationChange,
		onSortingChange,
		onColumnFiltersChange,
	} = useDataTableUrlState(parsers)

	const pageSize = Math.max(1, urlState.pageSize ?? 10)
	const pageCount = count === 0 ? 0 : Math.ceil(count / pageSize)

	const onRowClick = useCallback(
		(row: Publication) => {
			if (!row.chainId || !row.pubId) return

			router.push(`/publications/${row.chainId}/${row.pubId}`)
		},
		[router],
	)

	return (
		<>
			<div className="flex items-center gap-2">
				<BookOpenTextIcon className="h-4 w-4 text-primary" />
				<span className="font-bold text-primary text-sm uppercase tracking-widest">
					Publication Ledger
				</span>
			</div>
			<DataTableRoot
				columns={columns}
				data={publications}
				state={{
					pagination: {
						pageIndex: urlState.pageIndex,
						pageSize,
					},
					sorting: urlState.sort,
					columnFilters: urlState.filters,
				}}
				onColumnFiltersChange={onColumnFiltersChange}
				onSortingChange={onSortingChange}
				onPaginationChange={onPaginationChange}
				config={{
					manualFiltering: true,
					manualSorting: true,
					manualPagination: true,
					pageCount,
				}}
			>
				<DataTableToolbarSection className="w-full justify-between gap-4">
					<div>
						<DataTableFacetedFilter
							limitToFilteredRows={false}
							showCounts={false}
							accessorKey="chainId"
							options={chainOptions}
						/>
						<DataTableFacetedFilter
							limitToFilteredRows={false}
							showCounts={false}
							accessorKey="status"
							options={publicationStatusOptions}
						/>
						<DataTableClearFilter />
					</div>
				</DataTableToolbarSection>

				<DataTable>
					<DataTableHeader />
					<DataTableBody<Publication> onRowClick={onRowClick}>
						<DataTableEmptyBody />
					</DataTableBody>
				</DataTable>

				<DataTablePagination totalCount={count} defaultPageSize={pageSize} />
			</DataTableRoot>
		</>
	)
}
