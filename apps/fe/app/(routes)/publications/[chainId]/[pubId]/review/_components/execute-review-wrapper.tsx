import { ManifestCardSkeleton } from "@/app/_components/manifest-card-skeleton"
import { ManifestCardWrapper } from "@/app/_components/manifest-card-wrapper"
import { PublicationMainContentContainer } from "@/app/_components/publication-main-content-container"
import { type FC, Suspense } from "react"
import { ReviewForm } from "./review-form"
import { ReviewPublicationSummary } from "./review-publication-summary"

type Props = { rootCid: string | null }

export const ExecuteReviewWrapper: FC<Props> = (props) => {
	const { rootCid } = props

	return (
		<div className="grid grid-cols-1 @5xl:grid-cols-3 gap-8 items-start max-w-7xl mx-auto min-w-full">
			{/* Main Research Content Column */}
			<PublicationMainContentContainer>
				{rootCid && (
					<Suspense fallback={<ManifestCardSkeleton />}>
						<ManifestCardWrapper rootCid={rootCid} />
					</Suspense>
				)}
			</PublicationMainContentContainer>

			<aside className="sticky top-8 space-y-4">
				<ReviewPublicationSummary />
				<ReviewForm />
			</aside>
		</div>
	)
}
