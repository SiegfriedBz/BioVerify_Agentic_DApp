import { formatEther } from "viem"
import { z } from "zod"
import { ProtocolGlobalStats } from "../schemas/protocol-global-stats"

export const MappedProtocolGlobalStatsSchema = z.object({
  nextPubId: z.number(),
  memberCount: z.number(),
  rewardPool: z.string(), // wei
  slashedPool: z.string(),// wei

})
export type MappedProtocolGlobalStats = z.infer<typeof MappedProtocolGlobalStatsSchema>

export const ProtocolGlobalStatsMapper = (params: ProtocolGlobalStats): MappedProtocolGlobalStats => {
  const k = {
    nextPubId: Number(params.nextPubId),
    memberCount: Number(params.memberCount),
    rewardPool: formatEther(params.rewardPool),
    slashedPool: formatEther(params.slashedPool),
  }

  return MappedProtocolGlobalStatsSchema.parse(k)
}