import type { FC } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

export const ManifestCardSkeleton: FC = () => {
	return (
		<Card className="overflow-hidden border-border">
			<CardHeader className="bg-muted/30 pb-8 space-y-4">
				<div className="flex justify-between items-start gap-6">
					<div className="space-y-2 flex-1">
						<Skeleton className="h-8 w-3/4" />
						<Skeleton className="h-8 w-1/2" />
					</div>
					<Skeleton className="h-6 w-24 rounded-full" />
				</div>
				<Skeleton className="h-8 w-64 rounded-md" />
			</CardHeader>

			<CardContent className="pt-8 space-y-10">
				<div className="space-y-4">
					<Skeleton className="h-4 w-20" />
					<div className="space-y-2 pl-6">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-5/6" />
					</div>
				</div>

				<Separator />

				<div className="space-y-4">
					<Skeleton className="h-4 w-40" />
					<div className="p-6 rounded-xl border border-border/50 space-y-2">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-3/4" />
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
