"use client"

import { TypographyP } from "@/app/_components/typography"
import { Button } from "@/components/ui/button"
import { useAppKit } from "@reown/appkit/react"
import { WalletIcon } from "lucide-react"
import type { FC } from "react"

/** Connect prompt when there is no wallet address + chain (see ReviewerAssignmentsWalletGate). */
export const ReviewerGuestState: FC = () => {
	const { open } = useAppKit()

	return (
		<div className="flex flex-col items-center gap-6 rounded-xl border border-dashed border-border/40 bg-muted/10 p-10 text-center">
			<div className="flex size-14 items-center justify-center rounded-full bg-muted/30 text-primary">
				<WalletIcon className="size-7" />
			</div>
			<TypographyP className="mx-auto max-w-md text-sm text-muted-foreground">
				Connect your wallet to view assignments, register as a reviewer, and
				manage your stake.
			</TypographyP>
			<Button
				type="button"
				onClick={() => open()}
				className="h-11 cursor-pointer border-0 bg-[linear-gradient(135deg,#a4e6ff_0%,#00d1ff_100%)] font-semibold text-[#003543] shadow-[0_4px_20px_rgba(0,209,255,0.18)] transition-[filter,box-shadow] hover:bg-[linear-gradient(135deg,#a4e6ff_0%,#00d1ff_100%)] hover:text-[#003543] hover:brightness-110 hover:shadow-[0_6px_24px_rgba(0,209,255,0.22)] active:bg-[linear-gradient(135deg,#a4e6ff_0%,#00d1ff_100%)] active:text-[#003543] [&>svg]:text-[#003543]"
			>
				<WalletIcon className="size-4" />
				Connect Wallet
			</Button>
		</div>
	)
}
