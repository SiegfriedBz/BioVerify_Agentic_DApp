"use client"

import type { Publication } from "@packages/schema"
import { ChainIdToNetwork, NetworkToChainId } from "@packages/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { BookOpenCheckIcon, CircleSlash2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { type FC, useCallback } from "react"
import { useMySwitchChain } from "@/_hooks/use-my-switch-chain"
import { AddressDisplay } from "@/app/_components/address-display"
import { NetworkBadge } from "@/app/_components/network-badge"
import { ReviewerRoleBadge } from "@/app/_components/reviewer-role-badge"
import { SwitchChainButton } from "@/app/_components/switch-chain-button"
import { TypographySmall } from "@/app/_components/typography"
import { Button } from "@/components/ui/button"

type Params = {
	userAddress: string
}

export const useColumns = (params: Params): ColumnDef<Publication>[] => {
	const { userAddress } = params

	return [
		{
			accessorKey: "chainId",
			header: () => (
				<TypographySmall className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
					Network
				</TypographySmall>
			),
			cell: ({ row }) => {
				const chainId = row.original?.chainId
				if (!chainId) {
					return <CircleSlash2Icon />
				}

				return (
					<NetworkBadge network={ChainIdToNetwork[chainId]} pulseIcon={true} />
				)
			},
		},

		{
			accessorKey: "pubId",
			header: () => (
				<TypographySmall className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
					Publication
				</TypographySmall>
			),
			cell: ({ row }) => {
				const pubId = row.original?.pubId
				if (!pubId) {
					return <CircleSlash2Icon />
				}

				return pubId
			},
		},
		{
			accessorKey: "role",
			header: () => (
				<TypographySmall className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
					Your Role
				</TypographySmall>
			),
			cell: ({ row }) => {
				const isSenior =
					row.original.seniorReviewer?.toLowerCase() ===
					userAddress.toLowerCase()
				return <ReviewerRoleBadge isSeniorReviewer={isSenior} />
			},
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
			id: "actions",
			cell: ({ row }) => <ActionCell publication={row.original} />,
		},
	]
}

type ActionCellProps = {
	publication: Publication
}
const ActionCell: FC<ActionCellProps> = (props) => {
	const { publication } = props

	const { currentNetwork } = useMySwitchChain()
	const router = useRouter()

	const activeChainId = currentNetwork ? NetworkToChainId[currentNetwork] : null
	const isWrongNetwork = activeChainId !== publication.chainId

	const handleAction = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation()
			if (!publication.chainId || !publication.pubId) return

			router.push(
				`/publications/${publication.chainId}/${publication.pubId}/review`,
			)
		},
		[router, publication],
	)

	return (
		<div className="flex justify-end">
			{isWrongNetwork ? (
				<SwitchChainButton
					size="sm"
					className="font-bold text-[11px]"
					variant={"outline"}
				/>
			) : (
				<Button
					size="lg"
					onClick={handleAction}
					className="cursor-pointer bg-primary font-semibold tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
				>
					<BookOpenCheckIcon />
					Review Publication
				</Button>
			)}
		</div>
	)
}
