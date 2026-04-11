"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import type { ComponentProps, FC } from "react"

type Props = Omit<ComponentProps<typeof Button>, "onClick">

export const ClaimButton: FC<Props> = (props) => {
	const { className, children, ...rest } = props

	return (
		<Button
			{...rest}
			type="button"
			variant="default"
			className={cn("cursor-pointer text-center w-full", className)}
		>
			{rest.disabled ? (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					Processing...
				</>
			) : <span className="inline-block text-center font-bold">Claim Stake</span>}
		</Button>
	)
}
