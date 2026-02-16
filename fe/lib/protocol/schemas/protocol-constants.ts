
import { EthAddressSchema } from "@/app/_schemas/eth-address"
import { z } from "zod"

export const ProtocolConstantsSchema = z.object({
  agentAddress: EthAddressSchema,
  treasuryAddress: EthAddressSchema,
  numWords: z.bigint(), // number of random words from vrf = numbert of reviewers picked per publication review
  reputationBoost: z.bigint(),
  publisherMinfee: z.bigint(),
  publisherMinStake: z.bigint(),
  reviewerMinStake: z.bigint(),
  reviewerReward: z.bigint(),
  minReviewsCount: z.bigint(),
})

export type ProtocolConstants = z.infer<typeof ProtocolConstantsSchema>



