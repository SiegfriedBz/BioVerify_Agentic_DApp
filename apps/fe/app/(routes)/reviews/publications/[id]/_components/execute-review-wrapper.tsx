import { type FC, Suspense } from "react"
import { ManifestCardSkeleton } from "@/app/_components/manifest-card-skeleton"
import { ManifestCardWrapper } from "@/app/_components/manifest-card-wrapper"
import { PublicationMainContentContainer } from "@/app/_components/publication-main-content-container"
import { ReviewForm } from "./review-form"

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

			<aside className="space-y-8 sticky top-8">
				<section className="space-y-4">
					<h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
						Reviewer Decision
					</h3>
					<ReviewForm />
				</section>
			</aside>
		</div>
	)
}
