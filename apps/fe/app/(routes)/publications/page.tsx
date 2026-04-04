import { TypographyH1, TypographyP } from "@/app/_components/typography"
import type { SearchParams } from "nuqs/server"
import { Suspense } from "react"
import { PublicationsTableSkeleton } from "./_components/publications-table-skeleton"
import { StatsSkeleton } from "./_components/stats-skeleton"
import { StatsWrapper } from "./_components/stats-wrapper"
import { PublicationsTableWrapper } from "./_components/table/publications-table-wrapper"
import { searchParamsCache } from "./search-params"

type Props = {
	searchParams: Promise<SearchParams>
}

export default async function Page(props: Props) {
	const searchParams = await props.searchParams
	searchParamsCache.parse(searchParams)

	return (
		<>
			<header className="flex flex-col gap-1 border-b border-border pb-6">
				<TypographyH1 className="text-left">Protocol Overview</TypographyH1>
				<TypographyP className="text-muted-foreground text-sm">
					Real-time system metrics and parameters.
				</TypographyP>
			</header>

			<Suspense fallback={<StatsSkeleton />}>
				<StatsWrapper />
			</Suspense>

			<Suspense fallback={<PublicationsTableSkeleton />}>
				<PublicationsTableWrapper />
			</Suspense>
		</>
	)
}
