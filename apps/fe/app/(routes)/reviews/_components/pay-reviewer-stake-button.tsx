"use client"

import { Loader2 } from "lucide-react"
import type { ComponentProps, FC } from "react"
import { usePayReviewerStake } from "@/_hooks/cqrs/commands/use-pay-reviewer-stake"
import { useAuthFromWallet } from "@/_hooks/use-auth-from-wallet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = Omit<ComponentProps<typeof Button>, "onClick">

export const PayReviewerStakeButton: FC<Props> = (props) => {
	const { className, children, ...rest } = props

	// Get active user data for the mutation keys
	const { walletAddress, walletChainId } = useAuthFromWallet()

	const { mutate, isPending } = usePayReviewerStake({
		chainId: walletChainId as number,
		userAddress: walletAddress as string,
	})

	const handleStake = () => {
		mutate()
	}

	return (
		<Button
			{...rest}
			className={cn("cursor-pointer", className)}
			onClick={handleStake}
			disabled={isPending}
		>
			{isPending ? (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					Processing...
				</>
			) : (
				children
			)}
		</Button>
	)
}
