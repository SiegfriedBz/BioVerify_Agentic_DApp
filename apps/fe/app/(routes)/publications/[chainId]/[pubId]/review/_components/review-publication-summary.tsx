"use client"

import { ChainIdToNetwork } from "@packages/utils"
import { format } from "date-fns"
import { ShieldCheckIcon } from "lucide-react"
import type { FC } from "react"
import { useMemo } from "react"
import { usePublicationDetailContext } from "@/_hooks/context/use-publication-details-ctx"
import { useAuthFromWallet } from "@/_hooks/use-auth-from-wallet"
import { NetworkBadge } from "@/app/_components/network-badge"
import { ReviewerRoleBadge } from "@/app/_components/reviewer-role-badge"
import { TypographyH4, TypographySmall } from "@/app/_components/typography"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const ReviewPublicationSummary: FC = () => {
	const { publication } = usePublicationDetailContext()
	const { walletAddress } = useAuthFromWallet()

	const isSeniorReviewer = useMemo(() => {
		return (
			publication?.seniorReviewer?.toLowerCase() ===
			walletAddress?.toLowerCase()
		)
	}, [publication, walletAddress])

	if (!publication?.chainId || publication.pubId == null) {
		return null
	}

	const network = ChainIdToNetwork[publication.chainId]

	return (
		<Card
			className={cn(
				"border-border/40 bg-card/70 py-0 shadow-[0_20px_40px_rgba(14,20,27,0.4)] backdrop-blur-sm",
			)}
		>
			<CardContent className="space-y-3 p-6">
				<NetworkBadge network={network} />
				<TypographyH4 className="mt-0! scroll-m-0 border-0 pb-0">
					Pub #{publication.pubId}
				</TypographyH4>
				<ReviewerRoleBadge isSeniorReviewer={isSeniorReviewer} />
				<TypographySmall className="text-muted-foreground">
					Submitted {format(publication.createdAt, "PPP")}
				</TypographySmall>
				<div className="mt-3 flex items-start gap-3 rounded-lg border border-secondary/20 bg-secondary/10 px-3 py-2.5">
					<ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-secondary" />
					<div className="flex flex-col gap-0.5">
						<TypographySmall className="text-[10px] font-bold uppercase tracking-[0.15em] text-secondary">
							Immutability
						</TypographySmall>
						<TypographySmall className="text-[10px] leading-snug text-muted-foreground">
							Your signed verdict is anchored to the ledger by an AI Agent. It
							cannot be changed once submitted.
						</TypographySmall>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
