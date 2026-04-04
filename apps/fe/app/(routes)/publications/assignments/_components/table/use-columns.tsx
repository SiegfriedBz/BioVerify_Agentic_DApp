"use client"

import { useMySwitchChain } from "@/_hooks/use-my-switch-chain"
import { AddressDisplay } from "@/app/_components/address-display"
import { NetworkBadge } from "@/app/_components/network-badge"
import { SwitchChainButton } from "@/app/_components/switch-chain-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Publication } from "@packages/schema"
import { ChainIdToNetwork, NetworkToChainId } from "@packages/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { BookOpenCheckIcon, CircleSlash2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import type { FC } from "react"

type Params = {
	userAddress: string
}

export const useColumns = (params: Params): ColumnDef<Publication>[] => {
	const { userAddress } = params

	return [
		{
			accessorKey: "chainId",
			header: "Network",
			cell: ({ row }) => {
				const chainId = row.original?.chainId
				if (!chainId) {
					return <CircleSlash2Icon />
				}

				return <NetworkBadge network={ChainIdToNetwork[chainId]} />
			},
		},

		{
			accessorKey: "pubId",
			header: "Publication",
			cell: ({ row }) => {
				const pubId = row.original?.pubId
				if (!pubId) {
					return <CircleSlash2Icon />
				}

				return pubId
			},
		},
		{
			header: "Role",
			cell: ({ row }) => {
				const isSenior =
					row.original.seniorReviewer?.toLowerCase() ===
					userAddress.toLowerCase()
				return (
					<Badge
						variant={isSenior ? "default" : "secondary"}
						className="text-[10px] uppercase"
					>
						{isSenior ? "Senior Editor" : "Peer Reviewer"}
					</Badge>
				)
			},
		},
		{
			accessorKey: "publisher",
			header: "Publisher",
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
// Action Cell to handle Chain Switching
const ActionCell: FC<ActionCellProps> = (props) => {
	const { publication } = props

	const { currentNetwork } = useMySwitchChain()
	const router = useRouter()

	const activeChainId = currentNetwork ? NetworkToChainId[currentNetwork] : null
	const isWrongNetwork = activeChainId !== publication.chainId

	const handleAction = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (!publication.chainId || !publication.pubId) return

		router.push(`/publications/${publication.chainId}/${publication.pubId}/review`)
	}

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
					size="sm"
					onClick={handleAction}
					className="cursor-pointer font-bold text-[11px] items-center gap-x-2"
				>
					<BookOpenCheckIcon />
					Review
				</Button>
			)}
		</div>
	)
}
