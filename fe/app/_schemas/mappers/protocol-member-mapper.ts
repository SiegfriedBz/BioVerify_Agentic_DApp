import { formatEther } from "viem"
import { z } from "zod"
import { ProtocolMember } from "../schemas/contract/protocol-member"
import { EthAddressSchema } from "../schemas/eth-address"

export const MappedProtocolMemberSchema = z.object({
  memberAddress: EthAddressSchema,
  isReviewer: z.boolean(),
  reputation: z.number(),
  submittedPublicationsIds: z.array(z.number()).catch([]),
  stakes: z.string(), // wei
})
export type MappedProtocolMember = z.infer<typeof MappedProtocolMemberSchema>

export const ProtocolMemberMapper = (params: ProtocolMember): MappedProtocolMember => {
  const pub = {
    ...params,
    reputation: Number(params.reputation),
    submittedPublicationsIds: params.submittedPublicationsIds.map(id => Number(id)),
    stakes: formatEther(params.stakes),
  }
  return MappedProtocolMemberSchema.parse(pub)
}

