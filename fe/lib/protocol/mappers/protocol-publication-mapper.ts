import { EthAddressSchema } from "@/app/_schemas/eth-address"
import { ProtocolPublication, ProtocolPublicationStatusSchema } from "@/lib/protocol/schemas/protocol-publication"
import { formatEther } from "viem"
import { z } from "zod"

export const MappedProtocolPublicationSchema = z.object({
  id: z.number(),
  publisher: EthAddressSchema,
  reviewers: z.array(EthAddressSchema).catch([]),
  seniorReviewer: EthAddressSchema.optional(),
  cids: z.array(z.string()).min(1),
  status: ProtocolPublicationStatusSchema,
  stakes: z.string(), // wei
  paidSubmissionFee: z.string(), // wei
})
export type MappedProtocolPublication = z.infer<typeof MappedProtocolPublicationSchema>

export const ProtocolPublicationMapper = (params: ProtocolPublication): MappedProtocolPublication => {
  const pub = {
    ...params,
    id: Number(params.id),
    stakes: formatEther(params.stakes),
    paidSubmissionFee: formatEther(params.paidSubmissionFee),
  }

  return MappedProtocolPublicationSchema.parse(pub)
}