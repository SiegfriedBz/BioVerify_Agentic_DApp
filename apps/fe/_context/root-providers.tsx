import { TooltipProvider } from "@/components/ui/tooltip"
import type { FC, PropsWithChildren } from "react"
import { ThemeProvider } from "./theme-provider"
import { CustomWagmiProvider } from "./wagmi-provider"

type Props = {
	cookies: string | null
}

export const RootProviders: FC<PropsWithChildren<Props>> = (props) => {
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
					{children}
				</TooltipProvider>
			</CustomWagmiProvider>
		</ThemeProvider>
	)
}
