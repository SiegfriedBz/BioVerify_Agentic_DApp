import { ProtocolGlobalStatsMapper } from "@/app/_schemas/mappers/protocol-global-stats-mapper"
import { getProtocolGlobalStats } from "@/app/api/contract/get-protocol-global-stats"
import { FlaskConicalIcon, LandmarkIcon, ShieldAlertIcon, UsersIcon } from "lucide-react"
import { MetricCard } from "./metric-card"

export const StatsContainer = async () => {
  const rawStats = await getProtocolGlobalStats()
  const stats = ProtocolGlobalStatsMapper(rawStats)

  return (
    <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-4 gap-4">
      <MetricCard
        label="Reward Pool - ETH"
        value={stats.rewardPool}
        icon={LandmarkIcon}
        description="Available for honest reviewers"
      />
      <MetricCard
        label="Slashed Pool - ETH"
        value={stats.slashedPool}
        icon={ShieldAlertIcon}
        description="Protocol revenue from slashes"
      />
      <MetricCard
        label="Total Research"
        value={stats.nextPubId}
        icon={FlaskConicalIcon}
        description="Total publications submitted"
      />
      <MetricCard
        label="Active Members"
        value={stats.membersCount}
        icon={UsersIcon}
        description="Total protocol participants"
      />
    </div>
  )
}