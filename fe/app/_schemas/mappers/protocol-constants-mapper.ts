import { formatEther } from "viem"
import { z } from "zod"
import { ProtocolConstants } from "../schemas/contract/protocol-constants"
import { EthAddressSchema } from "../schemas/eth-address"

export const MappedProtocolConstantsSchema = z.object({
  agentAddress: EthAddressSchema,
  treasuryAddress: EthAddressSchema,
  numWords: z.number(),
  minReviewsCount: z.number(),
  reputationBoost: z.number(),
  publisherMinfee: z.string(), // wei
  publisherMinStake: z.string(), // wei
  reviewerMinStake: z.string(), // wei
  reviewerReward: z.string(), // wei
})

export type MappedProtocolConstants = z.infer<typeof MappedProtocolConstantsSchema>

export const ProtocolConstantsMapper = (params: ProtocolConstants): MappedProtocolConstants => {
  const k = {
    ...params,
    numWords: Number(params.numWords),
    minReviewsCount: Number(params.minReviewsCount),
    reputationBoost: Number(params.reputationBoost),
    publisherMinfee: formatEther(params.publisherMinfee),
    publisherMinStake: formatEther(params.publisherMinStake),
    reviewerMinStake: formatEther(params.reviewerMinStake),
    reviewerReward: formatEther(params.reviewerReward),
  }

  return MappedProtocolConstantsSchema.parse(k)
}