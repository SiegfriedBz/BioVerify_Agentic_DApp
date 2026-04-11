"use client"

import type { LucideIcon } from "lucide-react"
import { FlaskConicalIcon, GavelIcon, LayoutDashboardIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { type FC, useCallback } from "react"
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
	useSidebar,
} from "@/components/ui/sidebar"
import { SwitchChainButton } from "../switch-chain-button"
import { ConnectButton } from "./connect-button"

const navItems: {
	href: string
	icon: LucideIcon
	label: string
	tooltip: string
}[] = [
	{
		href: "/publications",
		icon: LayoutDashboardIcon,
		label: "Publications",
		tooltip: "Publications",
	},
	{
		href: "/publications/new",
		icon: FlaskConicalIcon,
		label: "Submit Publication",
		tooltip: "Submit Publication",
	},
	{
		href: "/publications/assignments",
		icon: GavelIcon,
		label: "Reviewer Portal",
		tooltip: "Review",
	},
]

const navButtonClassName =
	"hover:bg-[#343a42] data-[active=true]:border-l-2 data-[active=true]:border-[#00d1ff] data-[active=true]:rounded-l-none"

export const AppSidebar: FC = () => {
	const pathname = usePathname()
	const { isMobile, setOpenMobile } = useSidebar()

	const handleNavClick = useCallback(() => {
		if (isMobile) setOpenMobile(false)
	}, [isMobile, setOpenMobile])

	return (
		<Sidebar variant="floating" collapsible="icon">
			<SidebarHeader className="flex h-16 flex-col justify-center border-b border-border/50 px-4 md:group-data-[collapsible=icon]:px-2">
				<Link
					href="/"
					onClick={handleNavClick}
					className="flex items-center gap-2 overflow-hidden md:group-data-[collapsible=icon]:w-full md:group-data-[collapsible=icon]:justify-center"
				>
					<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#a4e6ff_0%,#00d1ff_100%)] font-black tracking-tight text-[#003543] shadow-[0_4px_20px_rgba(0,209,255,0.18)] ring-1 ring-primary/20">
						B
					</div>
					<span className="truncate bg-[linear-gradient(135deg,#a4e6ff_0%,#00d1ff_100%)] bg-clip-text font-bold text-xl tracking-tight text-transparent group-data-[collapsible=icon]:hidden">
						BioVerify
					</span>
				</Link>
			</SidebarHeader>

			<SidebarContent>
				{/* Connection Management Section */}
				<SidebarGroup>
					<SidebarGroupLabel className="text-[#bbc9cf]">
						Wallet
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<ConnectButton />
							</SidebarMenuItem>

							<SidebarMenuItem>
								<SidebarMenuButton asChild tooltip="Switch Network">
									<SwitchChainButton
										variant={"ghost"}
										className="flex w-full cursor-pointer justify-start group-data-[collapsible=icon]:justify-center"
									/>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* Navigation Section */}
				<SidebarGroup>
					<SidebarGroupLabel className="text-[#bbc9cf]">
						Protocol
					</SidebarGroupLabel>
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
										<Link href={href} onClick={handleNavClick}>
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
