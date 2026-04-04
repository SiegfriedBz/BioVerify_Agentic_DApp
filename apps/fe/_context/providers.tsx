import type { FC, PropsWithChildren } from "react"

import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSideBarProvider } from "./app-side-bar-provider"
import { ThemeProvider } from "./theme-provider"
import { CustomWagmiProvider } from "./wagmi-provider"

type Props = {
	cookies: string | null
}

export const Providers: FC<PropsWithChildren<Props>> = (props) => {
	const { cookies, children } = props

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="dark"
			enableSystem
			disableTransitionOnChange
		>
			<CustomWagmiProvider cookies={cookies}>
				<TooltipProvider>
					<AppSideBarProvider>{children}</AppSideBarProvider>
				</TooltipProvider>
			</CustomWagmiProvider>
		</ThemeProvider>
	)
}
