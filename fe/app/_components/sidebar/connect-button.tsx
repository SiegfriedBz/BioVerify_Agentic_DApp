"use client";

import { AppKitButton, useDisconnect } from "@reown/appkit/react";
import type { FC } from "react";
import { useConnection } from "wagmi";
import { Button } from "@/components/ui/button";

export const ConnectButton: FC = () => {
	const { isConnected } = useConnection();
	const { disconnect } = useDisconnect();

	return (
		<>
			{isConnected ? (
				<Button
					className="cursor-pointer"
					variant="secondary"
					size="sm"
					onClick={() => disconnect()}
				>
					Disconnect
				</Button>
			) : (
				<AppKitButton />
			)}
		</>
	);
};
