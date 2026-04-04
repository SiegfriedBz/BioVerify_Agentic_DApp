"use client"

import { ArrowLeftRightIcon } from "lucide-react"
import type { ComponentProps, FC } from "react"
import { useMySwitchChain } from "@/_hooks/use-my-switch-chain"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { NetworkToMessage } from "./network-badge"

type Props = Omit<ComponentProps<typeof Button>, "onClick">

export const SwitchChainButton: FC<Props> = (props) => {
	const { className, variant = "secondary", ...rest } = props

	const { onSwitch, nextNetwork } = useMySwitchChain()

	return (
		<Button
			{...rest}
			onClick={onSwitch}
			className={cn("cursor-pointer items-center gap-x-2", className)}
			variant={variant}
			type="button"
		>
			<ArrowLeftRightIcon />
			<span>Switch to {NetworkToMessage[nextNetwork]}</span>
		</Button>
	)
}
