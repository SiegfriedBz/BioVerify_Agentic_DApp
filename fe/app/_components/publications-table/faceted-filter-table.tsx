"use client"

import {
  DataTableClearFilter,
  DataTableDateFilter,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableSearchFilter,
  DataTableSliderFilter,
  DataTableToolbarSection,
  DataTableViewMenu,
} from "@/components/niko-table/components"
import {
  DataTable,
  DataTableBody,
  DataTableEmptyBody,
  DataTableHeader,
  DataTableRoot,
} from "@/components/niko-table/core"
import { columns, Product } from "./columns"


export function FacetedFilterTable({ data }: { data: Product[] }) {
  return (
    <DataTableRoot data={data} columns={columns}>
      <DataTableToolbarSection className="w-full flex-col justify-between gap-2">
        <DataTableToolbarSection className="px-0">
          <DataTableSearchFilter placeholder="Search products..." />
          <DataTableViewMenu />
        </DataTableToolbarSection>
        <DataTableToolbarSection className="flex-wrap px-0">
          {/* Category: show all options (not limited by other filters) */}
          <DataTableFacetedFilter
            accessorKey="category"
            multiple
            limitToFilteredRows={false}
          />
          {/* Brand: show only brands from filtered rows */}
          <DataTableFacetedFilter accessorKey="brand" limitToFilteredRows />
          <DataTableSliderFilter accessorKey="price" />
          <DataTableDateFilter accessorKey="releaseDate" multiple />
          <DataTableClearFilter />
        </DataTableToolbarSection>
      </DataTableToolbarSection>

      <DataTable>
        <DataTableHeader />
        <DataTableBody>
          <DataTableEmptyBody />
        </DataTableBody>
      </DataTable>

      <DataTablePagination />
    </DataTableRoot>
  )
}