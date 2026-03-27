"use client"

import { useMySwitchChain } from "@/_hooks/use-my-switch-chain"
import { AddressDisplay } from "@/app/_components/address-display"
import { NetworkBadge } from "@/app/_components/network-badge"
import { SwitchChainButton } from "@/app/_components/switch-chain-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Publication } from "@packages/schema"
import { ChainIdToNetwork, NetworkToChainId } from "@packages/utils"
import { ColumnDef } from "@tanstack/react-table"
import { CircleSlash2Icon, SendHorizontalIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { FC } from "react"

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

      }
    },
    {
      header: "Role",
      cell: ({ row }) => {
        const isSenior = row.original.seniorReviewer?.toLowerCase() === userAddress.toLowerCase()
        return (
          <Badge variant={isSenior ? "default" : "secondary"} className="text-[10px] uppercase">
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
    }
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
    if (!publication.chainId) return

    router.push(`/reviews/publications/${publication.id}`)
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
          variant={"default"}
          onClick={handleAction}
          className="cursor-pointer font-bold text-[11px] items-center gap-x-2"
        >
          <SendHorizontalIcon />
          Review Publication
        </Button>
      )
      }
    </div>
  )
}