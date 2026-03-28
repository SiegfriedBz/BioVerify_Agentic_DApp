import { formatEther } from "viem"
import { z } from "zod"
import { EthAddressSchema } from "../eth-address"
import { MemberRaw } from "./member-raw"

// UI Data
export const MemberSchema = z.object({
  id: z.string(),
  chainId: z.number(),
  address: EthAddressSchema,
  reputation: z.number(),
  activeReviewsCount: z.number(),
  rewardsCount: z.number(),
  slashesCount: z.number(),
  submittedPublicationsIds: z.array(z.string()),
  availableStake: z.string(),                    // Formatted ETH string
  lockedStake: z.string(),                       // Formatted ETH string
  isAvailable: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),

  // Indexing Metadata
  lastBlockNumber: z.string(),
  lastLogIndex: z.number(),
})
export type Member = z.infer<typeof MemberSchema>

export const mapMember = (params: MemberRaw): Member => {
  return MemberSchema.parse({
    ...params,
    reputation: Number(params.reputation),
    // IDs: BigInt[] -> String[]
    submittedPublicationsIds: params.submittedPublicationsIds?.map(id => id.toString()) ?? [],
    availableStake: formatEther(params.availableStake),
    lockedStake: formatEther(params.lockedStake),
    lastBlockNumber: params.lastBlockNumber.toString(),
  })
}