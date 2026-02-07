"use client";

import { type FC, useCallback } from "react";
import { useChains, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCurrentChain } from "../_hooks/use-current-chain";

export const ChangeChainButtons: FC = () => {
	const switchChain = useSwitchChain();
	const chains = useChains();
	const currentChain = useCurrentChain();

	const onSwitch = useCallback(
		(id: number) => {
			switchChain.mutate({ chainId: id });
		},
		[switchChain],
	);

	return (
		<ButtonGroup className="flex items-center">
			{chains.map((chain) => (
				<Tooltip key={chain.id}>
					<TooltipTrigger asChild>
						<Button
							variant="secondary"
							size="sm"
							className="cursor-pointer"
							onClick={() => onSwitch(chain.id)}
							disabled={currentChain?.id === chain.id}
						>
							{chain.name}
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>You are now on {currentChain?.name}. Click to switch.</p>
					</TooltipContent>
				</Tooltip>
			))}
		</ButtonGroup>
	);
};
