import { TypographyH2, TypographyP } from "@/app/_components/typography"
import { Suspense } from "react"
import { SubmitPublicationFormContainer } from "./_components/submit-publication-form-container"

export default function Page() {
	return (
		<div className="space-y-8 max-w-7xl mx-auto">
			<div className="flex flex-col gap-1 border-b border-border pb-6">
				<TypographyH2 className="text-3xl font-bold tracking-tight">
					New Research Submission
				</TypographyH2>
				<TypographyP className="text-muted-foreground mt-0!">
					Anchor your findings on the BioVerify ledger. Ensure your data hashes are correct before staking.
				</TypographyP>
			</div>

			<Suspense fallback={<>LOADING</>}>
				<SubmitPublicationFormContainer />
			</Suspense>
		</div>
	)
}
