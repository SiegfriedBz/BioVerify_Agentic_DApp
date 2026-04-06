"use client"

import { usePublicationDetailContext } from "@/_hooks/context/use-publication-details-ctx"
import { useAuthFromWallet } from "@/_hooks/use-auth-from-wallet"
import { TypographyH3 } from "@/app/_components/typography"
import { Lock } from "lucide-react"
import type { FC, PropsWithChildren } from "react"

export const ReviewerGuard: FC<PropsWithChildren> = (props) => {
	const { children } = props

	const { publication } = usePublicationDetailContext()
	const { walletAddress } = useAuthFromWallet()
	const userAddr = walletAddress?.toLowerCase()

	const isPeer = publication?.reviewers.some(
		(r) => r.toLowerCase() === userAddr,
	)
	const isSenior = publication?.seniorReviewer?.toLowerCase() === userAddr

	if (!userAddr || (!isPeer && !isSenior)) {
		return (
			<div className="mx-auto my-12 flex max-w-2xl flex-col items-center rounded-2xl border-2 border-dashed border-border/40 bg-muted/5 p-12 text-center">
				<div
					aria-hidden
					className="mb-4 flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted/10 text-muted-foreground/40 ring-1 ring-border/20"
				>
					<Lock className="size-7" strokeWidth={1.5} />
				</div>
				<TypographyH3 className="mt-0! scroll-m-0 border-0 pb-0 text-lg font-semibold tracking-tight">
					Restricted Assignment
				</TypographyH3>
				<p className="mx-auto mt-2 max-w-75 text-sm text-muted-foreground">
					This publication review is restricted to assigned peer reviewers and
					the designated senior auditor.
				</p>
				{!userAddr && (
					<p className="mt-4 text-xs font-medium uppercase tracking-widest text-primary">
						Please connect your wallet to verify identity
					</p>
				)}
			</div>
		)
	}

	return <>{children}</>
}
