import type { FC, PropsWithChildren } from "react"
import { AppSideBarProvider } from "./app-side-bar-provider"

export const SideProvider: FC<PropsWithChildren> = (props) => {
	const { children } = props

	return (
		<AppSideBarProvider>{children}</AppSideBarProvider>
	)
}
