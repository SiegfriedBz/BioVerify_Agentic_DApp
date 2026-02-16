import { EthAddressSchema } from "@/app/_schemas/eth-address"
import { formatEther } from "viem"
import { z } from "zod"
import { ProtocolMember } from "../schemas/protocol-member"

export const MappedProtocolMemberSchema = z.object({
  memberAddress: EthAddressSchema,
  isReviewer: z.boolean(),
  reputation: z.number(),
  publishedPublicationsIds: z.array(z.number()).catch([]),
  stakes: z.string(), // wei
})
export type MappedProtocolMember = z.infer<typeof MappedProtocolMemberSchema>

export const ProtocolMemberMapper = (params: ProtocolMember): MappedProtocolMember => {
  const pub = {
    ...params,
    reputation: Number(params.reputation),
    publishedPublicationsIds: params.publishedPublicationsIds.map(id => Number(id)),
    stakes: formatEther(params.stakes),
  }
  return MappedProtocolMemberSchema.parse(pub)
}

