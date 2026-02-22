"use client"

import { HasSubmittedReviewBadge } from "@/app/_components/has-submitted-review-badge"
import { ReviewerRoleBadge } from "@/app/_components/reviewer-role-badge"
import { MappedProtocolReviewerAssignment } from "@/app/_schemas/mappers/protoccol-reviewer-assignmement-mapper"
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
      <ReviewerRoleBadge isSeniorReviewer={row.original.isSeniorReviewer} />
    )
  },
  {
    id: "has_reviewed",
    header: "Status",
    cell: ({ row }) => <HasSubmittedReviewBadge
      reviewerAddress={row.original.address}
      publicationId={row.original.pubId}
    />,
  }
]
