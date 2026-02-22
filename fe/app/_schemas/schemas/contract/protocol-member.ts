
import { z } from "zod"
import { EthAddressSchema } from "../eth-address"

export const ProtocolMemberSchema = z.object({
  memberAddress: EthAddressSchema,
  stakes: z.bigint(), // wei
  publishedPublicationsIds: z.array(z.bigint()).catch([]),
  isReviewer: z.boolean(),
  reputation: z.bigint(),
})
export type ProtocolMember = z.infer<typeof ProtocolMemberSchema>

