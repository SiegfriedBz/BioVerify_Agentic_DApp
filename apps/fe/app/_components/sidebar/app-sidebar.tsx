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
import { BookCheckIcon, BookPlusIcon, LayoutDashboardIcon } from "lucide-react"
import Link from "next/link"
import type { FC } from "react"
import { SwitchChainButton } from "../switch-chain-button"
import { ConnectButton } from "./connect-button"

export const AppSidebar: FC = () => {
	return (
		<Sidebar variant="floating" collapsible="icon">
			<SidebarHeader className="h-16 border-b border-border/50 flex flex-col justify-center px-4">
				<Link href="/" className="flex items-center gap-2 overflow-hidden">
					<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black">
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
					<SidebarGroupLabel>Wallet</SidebarGroupLabel>
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
					<SidebarGroupLabel>Protocol</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild tooltip="Dashboard">
									<Link href="/publications">
										<LayoutDashboardIcon />
										<span>Dashboard</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>

							<SidebarMenuItem>
								<SidebarMenuButton asChild tooltip="Submit Publication">
									<Link href="/publications/new">
										<BookPlusIcon />
										<span>Submit Publication</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>

							<SidebarMenuItem>
								<SidebarMenuButton asChild tooltip="Review">
									<Link href="/publications/assignments">
										<BookCheckIcon />
										<span>Assignments</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarRail />
		</Sidebar>
	)
}
