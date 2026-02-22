import { formatEther } from "viem"
import { z } from "zod"
import { ProtocolGlobalStats } from "../schemas/contract/protocol-global-stats"

export const MappedProtocolGlobalStatsSchema = z.object({
  nextPubId: z.number(),
  membersCount: z.number(),
  rewardPool: z.string(), // wei
  slashedPool: z.string(),// wei

})
export type MappedProtocolGlobalStats = z.infer<typeof MappedProtocolGlobalStatsSchema>

export const ProtocolGlobalStatsMapper = (params: ProtocolGlobalStats): MappedProtocolGlobalStats => {
  const k = {
    nextPubId: Number(params.nextPubId),
    membersCount: Number(params.membersCount),
    rewardPool: formatEther(params.rewardPool),
    slashedPool: formatEther(params.slashedPool),
  }

  return MappedProtocolGlobalStatsSchema.parse(k)
}