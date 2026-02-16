import type { FC } from "react"
import { ChangeChainButtons } from "./sidebar/change-chain-buttons"
import { ConnectButton } from "./sidebar/connect-button"
import { ToggleModeButton } from "./toggle-mode-button"
import { UserAvatar } from "./user-avatar"

export const Header: FC = () => {
	return (
		<header className="h-16 flex justify-between items-center px-4">
			<span>BioVerify</span>

			<div className="flex gap-x-4 items-center">
				<UserAvatar />
				<ChangeChainButtons />
				<ConnectButton />
				<ToggleModeButton />
			</div>
		</header>
	)
}
