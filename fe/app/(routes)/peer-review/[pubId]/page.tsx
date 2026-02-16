import { TypographyH2, TypographyP } from "@/app/_components/typography"
import { Suspense } from "react"
import { ExecuteReviewContainer } from "./_components/execute-review-container"
import { ReviewGuard } from "./_components/reviewer-guard"

type Props = {
	params: Promise<{ pubId: string }>
}

export default async function Page(props: Props) {
	const { params } = props
	const { pubId } = await params

	return (
		<div className="space-y-8 max-w-7xl mx-auto">
			<div className="flex flex-col gap-1 border-b border-border pb-6">
				<TypographyH2 className="text-3xl font-bold tracking-tight">
					Review Assignment on Publication #{pubId}
				</TypographyH2>
				<TypographyP className="text-muted-foreground mt-0!">
					Evaluate the technical merit and data integrity of the submitted research manifest.
				</TypographyP>
			</div>

			<Suspense fallback={<>Loading Skeleton...</>}>
				<ReviewGuard pubId={pubId}>
					<ExecuteReviewContainer pubId={pubId} />
				</ReviewGuard>
			</Suspense>
		</div>

	)
}
