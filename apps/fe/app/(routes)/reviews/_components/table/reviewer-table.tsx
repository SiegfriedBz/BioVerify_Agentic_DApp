"use client"

import { networkOptions, NetworkToMessage } from "@/app/_components/network-badge"
import {
  DataTableClearFilter,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableToolbarSection
} from "@/components/niko-table/components"
import {
  DataTable,
  DataTableBody,
  DataTableEmptyBody,
  DataTableHeader,
  DataTableRoot,
} from "@/components/niko-table/core"
import { Publication } from "@packages/schema"
import { NetworkToChainId } from "@packages/utils"
import { FC } from "react"
import { useColumns } from "./use-columns"

type Props = {
  assignments: Publication[]
  count: number
  userAddress: string
}

export const ReviewerTable: FC<Props> = (props) => {
  const { assignments, count, userAddress } = props

  const columns = useColumns({ userAddress })

  return (
    <DataTableRoot
      data={assignments}
      rowCount={count}
      columns={columns}
      config={{
        enablePagination: true,
        enableSorting: true,
        enableFilters: true,
        manualPagination: true,
      }}
    >
      <DataTableToolbarSection className="w-full flex-col justify-between gap-4">
        <DataTableToolbarSection className="flex-wrap px-0 gap-2">
          <DataTableFacetedFilter
            accessorKey="chainId"
            options={networkOptions.map(op => {
              return {
                value: `${NetworkToChainId[op.value]}`,
                label: NetworkToMessage[op.value]
              }
            })}
          />
          <DataTableClearFilter />
        </DataTableToolbarSection>
      </DataTableToolbarSection>

      <DataTable>
        <DataTableHeader />
        <DataTableBody<Publication>
        >
          <DataTableEmptyBody />
        </DataTableBody>
      </DataTable>

      <DataTablePagination />
    </DataTableRoot>
  )
}