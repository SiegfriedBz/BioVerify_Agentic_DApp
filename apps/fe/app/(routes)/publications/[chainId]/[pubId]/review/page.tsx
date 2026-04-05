import { notFound } from "next/navigation"
import { Suspense } from "react"
import { TypographyH1, TypographyP } from "@/app/_components/typography"
import { ExecuteReviewWrapperSkeleton } from "./_components/execute-review-wrapper-skeleton"
import { ReviewerGuardWrapper } from "./_components/reviewer-guard-wrapper"

type Props = {
	params: Promise<{ chainId: string; pubId: string }>
}

export default async function Page(props: Props) {
	const { params } = props
	const { chainId, pubId } = await params

	if (!chainId || !pubId) {
		notFound()
	}

	const id = `${chainId}-${pubId}`

	return (
		<>
			<header className="flex flex-col gap-1 border-b border-border pb-6">
				<TypographyH1>Review Assignment</TypographyH1>
				<TypographyP className="text-muted-foreground text-sm">
					Evaluate the technical merit and data integrity of the submitted
					research manifest.
				</TypographyP>
			</header>

			<Suspense fallback={<ExecuteReviewWrapperSkeleton />}>
				<ReviewerGuardWrapper id={id} />
			</Suspense>
		</>
	)
}
