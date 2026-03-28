import { Skeleton } from "@/components/ui/skeleton"

export const PublicationDetailSkeleton = () => (
  <div className="w-full grid grid-cols-1 @5xl:grid-cols-3 gap-8">
    {/* Left Column: Header & Manifest */}
    <div className="@5xl:col-span-2 space-y-8 flex flex-col">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton
        className="w-full rounded-2xl"
        style={{ height: '600px' }} // Standardizing the large manifest block
      />
    </div>

    {/* Right Column: Timeline & Economics */}
    <div className="space-y-8 flex flex-col">
      <Skeleton
        className="w-full rounded-2xl"
        style={{ height: '320px' }} // Matches the Timeline card
      />
      <Skeleton
        className="w-full rounded-2xl"
        style={{ height: '400px' }} // Matches the Economics card
      />
    </div>
  </div>
)