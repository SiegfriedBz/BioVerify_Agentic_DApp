"use client"

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar"
import type { LucideIcon } from "lucide-react"
import { FlaskConicalIcon, GavelIcon, LayoutDashboardIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { FC } from "react"
import { SwitchChainButton } from "../switch-chain-button"
import { ConnectButton } from "./connect-button"

const navItems: { href: string; icon: LucideIcon; label: string; tooltip: string }[] = [
	{ href: "/publications", icon: LayoutDashboardIcon, label: "Publications", tooltip: "Publications" },
	{ href: "/publications/new", icon: FlaskConicalIcon, label: "Submit Publication", tooltip: "Submit Publication" },
	{ href: "/publications/assignments", icon: GavelIcon, label: "Reviewer Portal", tooltip: "Review" },
]

const navButtonClassName =
	"hover:bg-[#343a42] data-[active=true]:border-l-2 data-[active=true]:border-[#00d1ff] data-[active=true]:rounded-l-none"

export const AppSidebar: FC = () => {
	const pathname = usePathname()

	return (
		<Sidebar variant="floating" collapsible="icon">
			<SidebarHeader className="h-16 border-b border-border/50 flex flex-col justify-center px-4">
				<Link href="/" className="flex items-center gap-2 overflow-hidden">
					<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00d1ff] text-[#003543] font-black">
						B
					</div>
					<span className="font-bold text-xl tracking-tight truncate group-data-[collapsible=icon]:hidden">
						BioVerify
					</span>
				</Link>
			</SidebarHeader>

			<SidebarContent>
				{/* Connection Management Section */}
				<SidebarGroup>
					<SidebarGroupLabel className="text-[#bbc9cf]">Wallet</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								{/* ConnectButton already handles its own internal SidebarMenuButton with tooltip */}
								<ConnectButton />
							</SidebarMenuItem>

							<SidebarMenuItem>
								<SidebarMenuButton asChild tooltip="Switch Network">
									<SwitchChainButton
										variant={"ghost"}
										className="w-full cursor-pointer flex justify-start"
									/>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* Navigation Section */}
				<SidebarGroup>
					<SidebarGroupLabel className="text-[#bbc9cf]">Protocol</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{navItems.map(({ href, icon: Icon, label, tooltip }) => (
								<SidebarMenuItem key={href}>
									<SidebarMenuButton
										asChild
										tooltip={tooltip}
										isActive={pathname === href}
										className={navButtonClassName}
									>
										<Link href={href}>
											<Icon />
											<span>{label}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarRail />
		</Sidebar>
	)
}