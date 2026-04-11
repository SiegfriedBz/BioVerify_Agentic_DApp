import { Skeleton } from "@/components/ui/skeleton"

export const PublicationDetailSkeleton = () => (
	<div className="flex flex-col gap-8">
		<div className="w-full grid grid-cols-1 @5xl:grid-cols-3 gap-8 items-start max-w-7xl mx-auto">
			{/* Left column: header strip + manifest / verdict blocks */}
			<div className="@5xl:col-span-2 space-y-8 flex flex-col">
				<Skeleton className="h-32 w-full rounded-2xl" />
				<Skeleton className="w-full rounded-2xl" style={{ height: "600px" }} />
			</div>

			{/* Right column: Validation Trail, Economic Breakdown, Validation Team */}
			<div className="space-y-8 flex flex-col">
				<Skeleton className="w-full rounded-2xl" style={{ height: "320px" }} />
				<Skeleton className="w-full rounded-2xl" style={{ height: "240px" }} />
				<Skeleton className="w-full rounded-2xl" style={{ height: "280px" }} />
			</div>
		</div>
	</div>
)
