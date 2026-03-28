

import { getStatsGlobal } from "@packages/cqrs"
import { StatsContainer } from "./stats-container"

export const StatsWrapper = async () => {
  const stats = await getStatsGlobal()

  return <StatsContainer initialData={stats} />
}
