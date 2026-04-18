// app/(routes)/submit/_components/submit-publication-form-skeleton.tsx

import type { FC } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const SubmitPublicationFormSkeleton: FC = () => {
	return (
		<div className="grid grid-cols-1 @4xl:grid-cols-5 gap-8 items-start">
			{/* Left Column: Input Sections */}
			<div className="@4xl:col-span-3 space-y-6">
				<Card className="border-border shadow-sm">
					<CardContent className="py-6 space-y-8">
						{/* 1. Core Metadata */}
						<section className="space-y-4">
							<Skeleton className="h-3 w-32 mb-6" /> {/* Section Title */}
							<div className="space-y-2">
								<Skeleton className="h-4 w-12" /> {/* Label */}
								<Skeleton className="h-10 w-full" /> {/* Input */}
							</div>
							<div className="space-y-2">
								<Skeleton className="h-4 w-16" /> {/* Label */}
								<Skeleton className="h-24 w-full" /> {/* Textarea */}
							</div>
						</section>

						{/* 2. Research Body */}
						<section className="space-y-4 pt-6 border-t border-border/50">
							<Skeleton className="h-3 w-32 mb-6" />
							<div className="space-y-2">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-[200px] w-full" />{" "}
								{/* Large Manuscript area */}
							</div>
						</section>

						{/* 3. Contributors */}
						<section className="space-y-4 pt-6 border-t border-border/50">
							<div className="flex justify-between items-center mb-4">
								<Skeleton className="h-3 w-32" />
								<Skeleton className="h-8 w-24" /> {/* Add Button */}
							</div>
							{/* One Author Row Skeleton */}
							<div className="flex gap-4">
								<Skeleton className="h-10 flex-1" />
								<Skeleton className="h-10 flex-1" />
								<Skeleton className="h-10 flex-1" />
								<Skeleton className="h-10 w-10" />
							</div>
						</section>

						{/* 4. Economics */}
						<section className="space-y-4 pt-6 border-t border-border/50">
							<Skeleton className="h-3 w-40" />
							<div className="p-6 rounded-2xl border bg-muted/10 space-y-4">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-12 w-full" />
								<Skeleton className="h-3 w-3/4" />
							</div>
						</section>
					</CardContent>
				</Card>
			</div>

			{/* Right Column: Sidebar */}
			<aside className="@4xl:col-span-2 space-y-6 sticky top-8 h-fit">
				{/* Fee Calculator Skeleton */}
				<Card className="border-primary/20 bg-primary/2 overflow-hidden shadow-sm">
					<div className="h-10 bg-primary/5 border-b border-primary/10 flex items-center px-4">
						<Skeleton className="h-3 w-24" />
					</div>
					<CardContent className="p-5 space-y-6">
						<div className="flex justify-between">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-16" />
						</div>
						<div className="flex justify-between">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-4 w-16" />
						</div>
						<div className="pt-4 border-t flex justify-between">
							<Skeleton className="h-5 w-24" />
							<Skeleton className="h-8 w-32" />
						</div>
					</CardContent>
				</Card>

				{/* Submit Button Area */}
				<Card className="border-border/50 bg-muted/20">
					<CardContent className="py-6 space-y-4">
						<Skeleton className="h-6 w-32 rounded-full" /> {/* Network Badge */}
						<Skeleton className="h-12 w-full rounded-md" />{" "}
						{/* Submit Button */}
						<Skeleton className="h-3 w-full" />
					</CardContent>
				</Card>
			</aside>
		</div>
	)
}
