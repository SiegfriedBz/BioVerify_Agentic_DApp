// app/(routes)/submit/_components/chain-stats-skeleton.tsx

import type { FC } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const ChainStatsSkeleton: FC = () => {
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 @xl:grid-cols-2 gap-4">
				{Array.from({ length: 2 }).map((_, i) => (
					<Card key={i} className="border-border bg-card shadow-sm">
						<CardContent className="p-6">
							{/* Header: Label + Icon placeholder */}
							<div className="flex items-center justify-between pb-4">
								<Skeleton className="h-3 w-28" />
								<div className="rounded-full bg-primary/5 p-1">
									<Skeleton className="h-8 w-8 rounded-full" />
								</div>
							</div>

							{/* Body: Large value + description placeholder */}
							<div className="flex flex-col gap-2">
								<Skeleton className="h-8 w-32" />
								<Skeleton className="h-3 w-48" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)
}
