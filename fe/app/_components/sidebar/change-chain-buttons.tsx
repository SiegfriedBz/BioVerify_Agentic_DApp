"use client"

/**
 * @name ChangeChainButtons
 * @description A client-side network switcher that synchronizes the application's 
 * blockchain context across the Client and Server boundaries.
 * * @dev This component utilizes Wagmi's `useSwitchChain` to update the wallet provider.
 * Upon a successful mutation, it triggers a hard `window.location.reload()` to:
 * 1. Update the `wagmi.store` cookie.
 * 2. Force Next.js Server Components to re-fetch data based on the newly selected network.
 */
import { useCurrentChain } from "@/app/_hooks/use-current-chain"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { type FC, useCallback } from "react"
import { useChains, useSwitchChain } from "wagmi"

export const ChangeChainButtons: FC = () => {
	const switchChain = useSwitchChain()
	const chains = useChains()
	const currentChain = useCurrentChain()

	/**
	 * @notice Handles the network switching logic.
	 * @param id The unique EIP-155 chain ID to switch to.
	 * @callback onSuccess Triggers a full page reload to synchronize SSR state with the new cookie.
	 */
	const onSwitch = useCallback(
		(id: number) => {
			switchChain.mutate(
				{ chainId: id },
				{
					onSuccess: () => {
						// Necessary to force Server Components (e.g., AccountingCard) 
						// to re-read the updated 'wagmi.store' cookie.
						window.location.reload()
					},
				}
			)
		},
		[switchChain],
	)

	return (
		<ButtonGroup className="flex items-center">
			{chains.map((chain) => (
				<Tooltip key={chain.id}>
					<TooltipTrigger asChild>
						<Button
							variant="secondary"
							size="sm"
							className={cn("cursor-pointer", {
								"text-accent-foreground border-b-2 border-primary": currentChain?.id === chain.id,
								"text-muted-foreground opacity-50": currentChain?.id !== chain.id,
							})}
							onClick={() => onSwitch(chain.id)}
							disabled={currentChain?.id === chain.id}
						>
							{chain.name}
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>
							{currentChain?.id === chain.id
								? `Currently connected to ${chain.name}`
								: `Switch to ${chain.name}`}
						</p>
					</TooltipContent>
				</Tooltip>
			))}
		</ButtonGroup>
	)
}