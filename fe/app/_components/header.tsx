import type { FC } from "react";
import { ToggleModeButton } from "./toggle-mode-button";

export const Header: FC = () => {
	return (
		<header className="h-16 flex justify-between items-center px-4">
			<span>BioVerify</span>
			<ToggleModeButton />
		</header>
	);
};
