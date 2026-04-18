import type { FC } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export const ReviewFormSkeleton: FC = () => {
	return (
		<div className="space-y-4">
			<Card
				className={cn(
					"border-border/40 bg-card/70 py-0 shadow-[0_20px_40px_rgba(14,20,27,0.4)] backdrop-blur-sm",
				)}
			>
				<CardContent className="space-y-3 p-6">
					<Skeleton className="h-5 w-28" />
					<Skeleton className="h-7 w-40" />
					<Skeleton className="h-5 w-24" />
					<Skeleton className="h-3 w-32" />
					<div className="mt-3 h-12 w-full rounded-lg bg-secondary/5" />
				</CardContent>
			</Card>

			<Card className="overflow-hidden border-border shadow-md">
				<CardHeader className="space-y-3 border-b bg-muted/30 pb-4">
					<Skeleton className="h-4 w-24" />
				</CardHeader>

				<CardContent className="space-y-6 p-6">
					<div className="space-y-3">
						<Skeleton className="h-3 w-28" />
						<Skeleton className="h-3 w-16" />
						<div className="grid grid-cols-2 gap-4">
							<Skeleton className="h-20 w-full rounded-md" />
							<Skeleton className="h-20 w-full rounded-md" />
						</div>
					</div>

					<div className="space-y-3 border-t border-border/50 pt-4">
						<Skeleton className="h-3 w-32" />
						<Skeleton className="h-3 w-16" />
						<Skeleton className="h-30 w-full rounded-md" />
						<Skeleton className="h-3 w-3/4" />
					</div>
				</CardContent>

				<CardFooter>
					<div className="flex w-full items-center">
						<Skeleton className="h-12 w-1/3 rounded-r-none" />
						<div className="h-12 w-px bg-border/50" />
						<Skeleton className="h-12 w-2/3 rounded-l-none" />
					</div>
				</CardFooter>
			</Card>
		</div>
	)
}
