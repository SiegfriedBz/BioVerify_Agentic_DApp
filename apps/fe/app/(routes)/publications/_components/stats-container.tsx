"use client"

import { useGlobalStats } from "@/_hooks/cqrs/queries/use-global-stats"
import { FetchError } from "@/app/_components/fetch-error"
import { MetricCard } from "@/app/_components/metric-card"
import type { GlobalAggregateStats } from "@packages/cqrs"
import {
	FlaskConicalIcon,
	GlobeIcon,
	LandmarkIcon,
	ShieldAlertIcon,
	UsersIcon,
} from "lucide-react"
import { StatsSkeleton } from "./stats-skeleton"

type Props = {
	initialData: Awaited<GlobalAggregateStats>
}

export const StatsContainer = (props: Props) => {
	const { initialData } = props
	const {
		data: stats,
		isFetching,
		isError,
		refetch,
	} = useGlobalStats({ initialData })

	if (isError) return <FetchError refetch={refetch} />

	if (isFetching && !stats) {
		return <StatsSkeleton />
	}

	if (!stats) return null

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2 px-1">
				<GlobeIcon className="h-3 w-3 text-muted-foreground animate-pulse" />
				<span className="text-[10px] font-medium uppercase tracking-tighter text-muted-foreground">
					Aggregated data from <span className="text-primary font-semibold">{stats.networkCount}</span> Active Networks
				</span>
			</div>

			<div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-4 gap-4">
				<MetricCard
					label="Reward Pool - ETH"
					value={stats.rewardPool}
					icon={LandmarkIcon}
					description="Total liquidity for reviewers"
				/>
				<MetricCard
					label="Slashed Pool - ETH"
					value={stats.slashedPool}
					icon={ShieldAlertIcon}
					iconTone="error"
					description="Revenue from protocol integrity"
				/>
				<MetricCard
					label="Total Research"
					value={stats.totalPublications}
					icon={FlaskConicalIcon}
					iconTone="secondary"
					description="Publications across all chains"
				/>
				<MetricCard
					label="Active Members"
					value={stats.activeMembers}
					icon={UsersIcon}
					description="Unique participants in ecosystem"
				/>
			</div>
		</div>
	)
}
