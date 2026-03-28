"use client"

import { SidebarMenuButton } from "@/components/ui/sidebar"
import { ChainIdToNetwork } from "@packages/utils"
import { useAppKit, useAppKitAccount, useDisconnect } from "@reown/appkit/react"
import { LogOutIcon, WalletIcon } from "lucide-react"
import { FC } from "react"
import { useChainId } from "wagmi"
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
				className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground font-semibold"
			>
				<WalletIcon />
				<span>Connect Wallet</span>
			</SidebarMenuButton>
		)
	}

	return (
		<SidebarMenuButton
			onClick={() => disconnect()}
			className="h-auto py-2"
			tooltip="Disconnect"
		>
			<WalletIcon className="shrink-0" />

			<div className="flex flex-col items-start flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
				<span className="text-[11px] font-mono truncate w-full leading-tight">
					{address?.slice(0, 6)}...{address?.slice(-4)}
				</span>
				<div className="transform scale-90 origin-left -ml-1 mt-0.5">
					<NetworkSimpleBadge network={ChainIdToNetwork[activeChainId]} />
				</div>
			</div>

			<LogOutIcon className="ml-auto h-4 w-4 shrink-0 opacity-50 transition-opacity hover:opacity-100 group-data-[collapsible=icon]:hidden" />
		</SidebarMenuButton>
	)
}