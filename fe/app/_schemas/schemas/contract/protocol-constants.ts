

import { z } from "zod"
import { EthAddressSchema } from "../eth-address"

export const ProtocolConstantsSchema = z.object({
  agentAddress: EthAddressSchema,
  treasuryAddress: EthAddressSchema,
  numWords: z.number(), // number of random words from vrf = numbert of reviewers picked per publication review
  reputationBoost: z.bigint(),
  publisherMinfee: z.bigint(),
  publisherMinStake: z.bigint(),
  reviewerMinStake: z.bigint(),
  reviewerReward: z.bigint(),
  minReviewsCount: z.number(),
})

export type ProtocolConstants = z.infer<typeof ProtocolConstantsSchema>



