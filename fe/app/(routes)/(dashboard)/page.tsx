import { TypographyH1, TypographyP } from "@/app/_components/typography"
import { Suspense } from "react"
import { PublicationsTableContainer } from "./_components/publications-table-container"
import { PublicationsTableSkeleton } from "./_components/publications-table-skeleton"
import { StatsContainer } from "./_components/stats-container"
import { StatsSkeleton } from "./_components/stats-skeleton"

export default function Page() {
	return (
		<div className="flex flex-col gap-8">
			<header className="flex flex-col gap-1">
				<TypographyH1 className="text-left">Protocol Overview</TypographyH1>
				<TypographyP className="text-muted-foreground mt-0! text-sm">
					Real-time system metrics and parameters.
				</TypographyP>
			</header>

			<Suspense fallback={<StatsSkeleton />}>
				<StatsContainer />
			</Suspense>

			<Suspense fallback={<PublicationsTableSkeleton />}>
				<PublicationsTableContainer />
			</Suspense>
		</div>
	)
}