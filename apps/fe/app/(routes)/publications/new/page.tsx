import { TypographyH1, TypographyP } from "@/app/_components/typography"
import { Suspense } from "react"
import { ChainStatsSkeleton } from "./_components/chain-stats-skeleton"
import { ChainStatsWrapper } from "./_components/chain-stats-wrapper"
import { SubmitPublicationFormSkeleton } from "./_components/submit-publication-form-skeleton"
import { SubmitPublicationFormWrapper } from "./_components/submit-publication-form-wrapper"

export default function Page() {
	return (
		<>
			<header className="flex flex-col gap-1 border-b border-border pb-6">
				<TypographyH1>New Publication Submission</TypographyH1>
				<TypographyP className="text-muted-foreground text-sm">
					Anchor your findings on the BioVerify ledger. Ensure your data hashes
					are correct before staking.
				</TypographyP>
			</header>

			<div className="flex flex-col gap-8">
				<Suspense fallback={<ChainStatsSkeleton />}>
					<ChainStatsWrapper />
				</Suspense>

				<Suspense fallback={<SubmitPublicationFormSkeleton />}>
					<SubmitPublicationFormWrapper />
				</Suspense>
			</div>
		</>
	)
}
