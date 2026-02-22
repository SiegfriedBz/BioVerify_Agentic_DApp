import { z } from "zod"

export const ProtocolGlobalStatsSchema = z.object({
  rewardPool: z.bigint(),
  slashedPool: z.bigint(),
  nextPubId: z.bigint(),
  membersCount: z.bigint(),
})

export type ProtocolGlobalStats = z.infer<typeof ProtocolGlobalStatsSchema>