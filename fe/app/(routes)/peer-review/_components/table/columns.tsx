"use client"

import { Badge } from "@/components/ui/badge"
import { MappedProtocolReviewerAssignment } from "@/lib/protocol/mappers/protoccol-reviewer-assignmement-mapper"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<MappedProtocolReviewerAssignment>[] = [
  {
    accessorKey: "id",
    header: "Pub ID",
    cell: ({ row }) => <span className="font-mono text-xs">#{row.original.pubId}</span>
  },
  {
    accessorKey: "cid",
    header: "Manifest CID",
    cell: ({ row }) => (
      <span className="font-mono text-[10px] text-muted-foreground truncate max-w-30 block">
        {row.original.cid}
      </span>
    )
  },
  {
    accessorKey: "role",
    header: "Assignment Role",
    cell: ({ row }) => (
      <Badge variant={row.original.isSeniorReviewer ? "default" : "outline"} className="text-[10px] uppercase">
        {row.original.isSeniorReviewer ? "Senior" : "Peer"}
      </Badge>
    )
  }
]
