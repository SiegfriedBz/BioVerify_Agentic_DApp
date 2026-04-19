"use client"

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
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
import { useAppKitAccount } from "@reown/appkit/react"
import type { LucideIcon } from "lucide-react"
import {
	ExternalLinkIcon,
	FlaskConicalIcon,
	GavelIcon,
	LayoutDashboardIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { type FC, useCallback } from "react"
import { contractLinks, socialLinks } from "../external-links"
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
	const { isConnected } = useAppKitAccount()

	const handleNavClick = useCallback(() => {
		if (isMobile) setOpenMobile(false)
	}, [isMobile, setOpenMobile])

	return (
		<Sidebar variant="floating" collapsible="icon">
			<SidebarHeader className="flex h-16 flex-col justify-center border-b border-border/50">
				<Link
					href="/"
					onClick={handleNavClick}
					className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
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
				<SidebarGroup>
					<SidebarGroupLabel className="text-[#bbc9cf]">
						Wallet
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<ConnectButton />
							</SidebarMenuItem>

							{isConnected && (
								<SidebarMenuItem>
									<SidebarMenuButton asChild tooltip="Switch Network">
										<SwitchChainButton
											variant={"ghost"}
											className="flex w-full cursor-pointer justify-start group-data-[collapsible=icon]:justify-center"
										/>
									</SidebarMenuButton>
								</SidebarMenuItem>
							)}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

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

			<SidebarFooter className="border-t border-border/50 group-data-[collapsible=icon]:overflow-hidden">
				{contractLinks.length > 0 && (
					<SidebarGroup className="p-0">
						<SidebarGroupLabel className="text-[#bbc9cf]">
							Contracts
						</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{contractLinks.map(({ href, label, tooltip }) => (
									<SidebarMenuItem key={label}>
										<SidebarMenuButton
											asChild
											tooltip={tooltip}
											className="hover:bg-[#343a42]"
										>
											<a href={href} target="_blank" rel="noopener noreferrer">
												<ExternalLinkIcon className="size-4" />
												<span>{label}</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)}

				{socialLinks.length > 0 && (
					<SidebarGroup className="p-0">
						<SidebarGroupLabel className="text-[#bbc9cf]">
							Social
						</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{socialLinks.map(({ href, label, icon: Icon, tooltip }) => (
									<SidebarMenuItem key={label}>
										<SidebarMenuButton
											asChild
											tooltip={tooltip}
											className="hover:bg-[#343a42]"
										>
											<a href={href} target="_blank" rel="noopener noreferrer">
												<Icon className="size-4" />
												<span>{label}</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)}
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	)
}
