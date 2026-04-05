"use client"

import { ChainIdToNetwork } from "@packages/utils"
import { useAppKit, useAppKitAccount, useDisconnect } from "@reown/appkit/react"
import { LogOutIcon, WalletIcon } from "lucide-react"
import type { FC } from "react"
import { useChainId } from "wagmi"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { NetworkSimpleBadge } from "../network-badge"

export const ConnectButton: FC = () => {
	const { open } = useAppKit()
	const { isConnected, address } = useAppKitAccount()
	const { disconnect } = useDisconnect()

	// Detect MetaMask manual changes
	const activeChainId = useChainId()

	if (!isConnected) {
		return (
			<SidebarMenuButton
				onClick={() => open()}
				tooltip="Connect Wallet"
				className="border-0 bg-[linear-gradient(135deg,#a4e6ff_0%,#00d1ff_100%)] font-semibold text-[#003543] shadow-[0_4px_20px_rgba(0,209,255,0.18)] transition-[filter,box-shadow] hover:bg-[linear-gradient(135deg,#a4e6ff_0%,#00d1ff_100%)] hover:text-[#003543] hover:brightness-110 hover:shadow-[0_6px_24px_rgba(0,209,255,0.22)] active:bg-[linear-gradient(135deg,#a4e6ff_0%,#00d1ff_100%)] active:text-[#003543] [&>svg]:text-[#003543] hover:[&>svg]:text-[#003543]"
			>
				<WalletIcon />
				<span>Connect Wallet</span>
			</SidebarMenuButton>
		)
	}

	return (
		<SidebarMenuButton
			onClick={() => disconnect()}
			className="h-auto min-h-10 gap-2 py-2 hover:bg-[#343a42] active:bg-[#343a42]"
			tooltip="Disconnect"
		>
			<WalletIcon className="size-4 shrink-0 text-[#a4e6ff]" />

			<div className="flex min-w-0 flex-1 flex-col items-stretch gap-1 overflow-hidden group-data-[collapsible=icon]:hidden">
				<span className="w-full truncate font-mono text-xs leading-tight tracking-[-0.02em] text-sidebar-foreground">
					{address?.slice(0, 6)}…{address?.slice(-4)}
				</span>
				<div className="flex w-full min-w-0">
					<NetworkSimpleBadge network={ChainIdToNetwork[activeChainId]} />
				</div>
			</div>

			<LogOutIcon className="ml-auto size-4 shrink-0 text-[#bbc9cf] opacity-80 transition-[color,opacity] group-hover/menu-item:text-[#a4e6ff] group-hover/menu-item:opacity-100 group-data-[collapsible=icon]:hidden" />
		</SidebarMenuButton>
	)
}
