"use client"

import { type Publication, PublicationStatusSchema } from "@packages/schema"
import { ChainIdToNetwork } from "@packages/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { CircleOffIcon, CircleSlash2Icon, DicesIcon } from "lucide-react"
import { AddressDisplay } from "@/app/_components/address-display"
import { NetworkBadge, networkOptions } from "@/app/_components/network-badge"
import {
	PublicationStatusBadge,
	publicationStatusOptions,
} from "@/app/_components/publication-status-badge"
import { TypographySmall } from "@/app/_components/typography"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<Publication>[] = [
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
		accessorKey: "status",
		header: () => (
			<TypographySmall className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
				Status
			</TypographySmall>
		),
		cell: ({ row }) => (
			<PublicationStatusBadge status={row.getValue("status")} />
		),
		meta: {
			label: "Status",
			variant: "select",
			options: publicationStatusOptions,
		},
		enableColumnFilter: true,
		enableGlobalFilter: true,
	},

	{
		accessorKey: "chainId",
		header: () => (
			<TypographySmall className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
				Network
			</TypographySmall>
		),
		cell: ({ row }) => {
			const chainId = row.original?.chainId
			const status = row.original?.status
			if (!chainId) {
				return <CircleSlash2Icon />
			}

			const pulseIcon =
				status === PublicationStatusSchema.enum.SUBMITTED ||
				status === PublicationStatusSchema.enum.IN_REVIEW

			return (
				<NetworkBadge
					network={ChainIdToNetwork[chainId]}
					pulseIcon={pulseIcon}
				/>
			)
		},
		meta: {
			label: "Network",
			variant: "select",
			options: networkOptions,
		},
		enableColumnFilter: true,
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

			if (status === PublicationStatusSchema.enum.EARLY_SLASHED) {
				return (
					<div className="flex items-center gap-2 ">
						<CircleOffIcon
							className="h-3.5 w-3.5 shrink-0 text-(--error)/60"
							aria-hidden
						/>
						<TypographySmall className="text-muted-foreground text-xs font-medium leading-snug">
							Terminated by AI Shield
						</TypographySmall>
					</div>
				)
			}

			if (reviewers.length === 0) {
				return (
					<div className="flex items-center gap-2">
						<DicesIcon
							className="h-3.5 w-3.5 shrink-0 text-primary/80 animate-pulse"
							aria-hidden
						/>
						<TypographySmall className="text-muted-foreground text-xs font-medium leading-snug">
							Awaiting VRF Selection...
						</TypographySmall>
					</div>
				)
			}

			return (
				<div className="flex flex-col gap-1.5 py-1">
					<div className="flex items-center gap-2">
						<AddressDisplay
							address={seniorReviewer as string}
							className="h-6 px-1 text-primary hover:bg-primary/5"
						/>
						<Badge
							variant="outline"
							className="text-[8px] h-4 px-1 uppercase border-primary/30 text-primary"
						>
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
		accessorKey: "lockedStake",
		header: () => (
			<TypographySmall className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground text-right">
				Locked Stake
			</TypographySmall>
		),
		cell: ({ row }) => {
			const amount = row.original.lockedStake
			return (
				<div className="flex flex-wrap items-baseline gap-1">
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
