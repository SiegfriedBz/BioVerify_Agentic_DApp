import { Suspense } from "react"
import { TypographyH1, TypographyP } from "@/app/_components/typography"
import { ChainStatsSkeleton } from "./_components/chain-stats-skeleton"
import { ChainStatsWrapper } from "./_components/chain-stats-wrapper"
import { SubmitPublicationFormSkeleton } from "./_components/submit-publication-form-skeleton"
import { SubmitPublicationFormWrapper } from "./_components/submit-publication-form-wrapper"

export default function Page() {
	return (
		<div className="flex flex-col gap-8">
			<header className="mb-2 flex flex-col gap-1 border-b border-border pb-6">
				<TypographyH1 className="text-3xl font-bold tracking-tight">
					New Publication Submission
				</TypographyH1>
				<TypographyP className="text-muted-foreground mt-0!">
					Anchor your findings on the BioVerify ledger. You can submit your
					publication on Base Sepolia or Sepolia ETH by switching your network
					in your wallet.
				</TypographyP>
			</header>

			<Suspense fallback={<ChainStatsSkeleton />}>
				<ChainStatsWrapper />
			</Suspense>

			<Suspense fallback={<SubmitPublicationFormSkeleton />}>
				<SubmitPublicationFormWrapper />
			</Suspense>
		</div>
	)
}
