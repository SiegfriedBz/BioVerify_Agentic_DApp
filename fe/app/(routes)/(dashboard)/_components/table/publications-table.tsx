"use client"

import {
  DataTableClearFilter,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableSliderFilter,
  DataTableToolbarSection,
  DataTableViewMenu
} from "@/components/niko-table/components"
import {
  DataTable,
  DataTableBody,
  DataTableEmptyBody,
  DataTableHeader,
  DataTableRoot,
} from "@/components/niko-table/core"
import { MappedProtocolPublication } from "@/lib/protocol/mappers/protocol-publication-mapper"
import { useRouter } from "next/navigation"
import { FC } from "react"
import { columns } from "./columns"

type Props = { publications: MappedProtocolPublication[] }

export const PublicationsTable: FC<Props> = (props) => {
  const { publications } = props
  const router = useRouter()

  return (
    <DataTableRoot data={publications} columns={columns}>
      <DataTableToolbarSection className="w-full flex-col justify-between gap-4">
        <DataTableToolbarSection className="px-0">
          <DataTableViewMenu />
        </DataTableToolbarSection>

        <DataTableToolbarSection className="flex-wrap px-0 gap-2">
          {/* Status Filter */}
          <DataTableFacetedFilter
            accessorKey="status"
            multiple
            limitToFilteredRows={false}
          />
          {/* Stakes Slider */}
          <DataTableSliderFilter accessorKey="stakes" />
          <DataTableClearFilter />
        </DataTableToolbarSection>
      </DataTableToolbarSection>

      <DataTable>
        <DataTableHeader />
        <DataTableBody<MappedProtocolPublication> onRowClick={(row) => router.push(`/publications/${row.id}`)}>
          <DataTableEmptyBody />
        </DataTableBody>
      </DataTable>

      <DataTablePagination />
    </DataTableRoot>
  )
}