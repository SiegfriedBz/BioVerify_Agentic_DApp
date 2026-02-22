"use client"

import { MappedProtocolReviewerAssignment } from "@/app/_schemas/mappers/protoccol-reviewer-assignmement-mapper"
import {
  DataTable,
  DataTableBody,
  DataTableEmptyBody,
  DataTableHeader,
  DataTableRoot
} from "@/components/niko-table/core"
import { useRouter } from "next/navigation"
import { FC } from "react"
import { columns } from "./columns"

type Props = {
  assignments: MappedProtocolReviewerAssignment[]
}

export const ReviewAssignmentsTable: FC<Props> = ({ assignments }) => {
  const router = useRouter()

  return (
    <div className="w-full">
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <DataTableRoot data={assignments} columns={columns}>
          <DataTable>
            <DataTableHeader className="bg-muted/30" />
            <DataTableBody<MappedProtocolReviewerAssignment>
              onRowClick={(row) => {
                router.push(`/peer-review/${row.pubId}`)
              }}
            >
              <DataTableEmptyBody>No active peer-review assignments.</DataTableEmptyBody>
            </DataTableBody>
          </DataTable>
        </DataTableRoot>
      </div>
    </div>
  )
}