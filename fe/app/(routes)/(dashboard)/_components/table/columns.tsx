"use client"

import { AddressDisplay } from "@/app/_components/address-display"
import { PublicationStatusBadge } from "@/app/_components/publication-status-badge"
import { TypographySmall } from "@/app/_components/typography"
import { MappedProtocolPublication } from "@/app/_schemas/mappers/protocol-publication-mapper"
import { ProtocolPublicationStatusSchema } from "@/app/_schemas/schemas/contract/protocol-publication"
import { Badge } from "@/components/ui/badge"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<MappedProtocolPublication>[] = [
  {
    accessorKey: "id",
    header: () => (
      <TypographySmall className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
        ID
      </TypographySmall>
    ),
    cell: ({ row }) => (
      <TypographySmall className="font-mono text-foreground/70">
        #{row.getValue("id")}
      </TypographySmall>
    ),
  },
  {
    accessorKey: "publisher",
    header: () => (
      <TypographySmall className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
        Publisher
      </TypographySmall>
    ),
    cell: ({ row }) => <AddressDisplay address={row.getValue("publisher")} />,
  },
  {
    accessorKey: "reviewers",
    header: () => (
      <TypographySmall className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
        Reviewers Pool
      </TypographySmall>
    ),
    cell: ({ row }) => {
      const { seniorReviewer, reviewers, status } = row.original

      // Logic for Submission Agent Slash
      if (reviewers.length === 0 && status === ProtocolPublicationStatusSchema.enum.SLASHED) {
        return (
          <div className="flex items-center gap-2">
            <TypographySmall className="text-destructive/70 font-medium text-[10px]">
              Terminated by AI Shield
            </TypographySmall>
          </div>
        )
      }

      // Logic for Awaiting VRF (Submitted or currently being screened)
      if (reviewers.length === 0) {
        return (
          <TypographySmall className="text-muted-foreground/40 italic text-[10px]">
            Awaiting VRF Selection...
          </TypographySmall>
        )
      }

      // Logic for Active Reviewers
      return (
        <div className="flex flex-col gap-1.5 py-1">
          <div className="flex items-center gap-2">
            <AddressDisplay
              address={seniorReviewer as string}
              className="h-6 px-1 text-primary hover:bg-primary/5"
            />
            <Badge variant="outline" className="text-[8px] h-4 px-1 uppercase border-primary/30 text-primary">
              Senior
            </Badge>
          </div>
          {reviewers.length > 0 && (
            <TypographySmall className="text-[9px] text-muted-foreground px-2">
              + {reviewers.length} Peer Reviewers
            </TypographySmall>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: () => (
      <TypographySmall className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
        Status
      </TypographySmall>
    ),
    cell: ({ row }) => <PublicationStatusBadge status={row.getValue("status")} />,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "stakes",
    header: () => (
      <TypographySmall className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground text-right">
        Stake
      </TypographySmall>
    ),
    cell: ({ row }) => {
      const amount = row.original.stakes // Already formatted by your mapper
      return (
        <div className="flex flex-col items-end gap-0">
          <span className="font-mono font-bold text-sm leading-none text-foreground">
            {amount}
          </span>
          <TypographySmall className="text-[9px] text-muted-foreground uppercase font-semibold">
            ETH
          </TypographySmall>
        </div>
      )
    },
  },
]