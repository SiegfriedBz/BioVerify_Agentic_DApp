import { TooltipProvider } from "@radix-ui/react-tooltip"
import type { FC, PropsWithChildren } from "react"
import { AppSideBarProvider } from "./app-side-bar-provider"
import CustomWagmiProvider from "./wagmi-provider"

type Props = {
	cookies: string | null
}
export const SideProvider: FC<PropsWithChildren<Props>> = (props) => {
	const { cookies, children } = props

	return (
		<CustomWagmiProvider cookies={cookies}>
			<TooltipProvider>
				<AppSideBarProvider>{children}</AppSideBarProvider>
			</TooltipProvider>
		</CustomWagmiProvider>
	)
}
