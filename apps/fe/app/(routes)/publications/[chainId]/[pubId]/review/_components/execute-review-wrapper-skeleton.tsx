import type { FC } from "react"
import { ManifestCardSkeleton } from "@/app/_components/manifest-card-skeleton"
import { ReviewFormSkeleton } from "./review-form-skeleton"

export const ExecuteReviewWrapperSkeleton: FC = () => {
	return (
		<div className="grid grid-cols-1 @5xl:grid-cols-3 gap-8 items-start max-w-7xl mx-auto min-w-full">
			{/* Main Research Content Column */}
			<ManifestCardSkeleton />

			{/* Aside Column */}
			<aside className="sticky top-8 space-y-4">
				<ReviewFormSkeleton />
			</aside>
		</div>
	)
}
