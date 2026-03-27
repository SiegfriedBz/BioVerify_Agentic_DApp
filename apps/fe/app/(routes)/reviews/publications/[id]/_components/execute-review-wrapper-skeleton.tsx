import { ManifestCardSkeleton } from "@/app/_components/manifest-card-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { FC } from "react"
import { ReviewFormSkeleton } from "./review-form-skeleton"

export const ExecuteReviewWrapperSkeleton: FC = () => {
  return (
    <div className="grid grid-cols-1 @5xl:grid-cols-3 gap-8 items-start max-w-7xl mx-auto min-w-full">
      {/* Main Research Content Column */}
      <ManifestCardSkeleton />

      {/* Aside Column */}
      <aside className="space-y-8 sticky top-8">
        <section className="space-y-4">
          <div className="px-1">
            <Skeleton className="h-3 w-32" /> {/* "Reviewer Decision" label */}
          </div>
          <ReviewFormSkeleton />
        </section>
      </aside>
    </div>
  )
}