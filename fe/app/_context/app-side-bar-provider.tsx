"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import type { FC, PropsWithChildren } from "react"
import { AppSidebar } from "../_components/sidebar/app-sidebar"

export const AppSideBarProvider: FC<PropsWithChildren> = (props) => {
	const { children } = props

	return (
		<SidebarProvider>
			<AppSidebar />
			<div className="flex min-h-screen w-full flex-col bg-background font-sans">
				<header className="flex h-12 items-center px-4 border-b border-border/50">
					<SidebarTrigger />
				</header>

				<main className="@container flex-1 p-4 @md:p-8">
					<div className="mx-auto w-full max-w-350">
						{children}
					</div>
				</main>
			</div>
		</SidebarProvider>
	)
}
