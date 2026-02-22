import { formatEther } from "viem"
import { z } from "zod"
import { ProtocolPublication, ProtocolPublicationStatusSchema } from "../schemas/contract/protocol-publication"
import { EthAddressSchema } from "../schemas/eth-address"

const STATUS_MAP = Object.values(ProtocolPublicationStatusSchema.options)

export const MappedProtocolPublicationSchema = z.object({
  id: z.number(),
  publisher: EthAddressSchema,
  reviewers: z.array(EthAddressSchema).catch([]),
  seniorReviewer: EthAddressSchema.optional(),
  cids: z.array(z.string()).min(1),
  status: ProtocolPublicationStatusSchema,
  stakes: z.string(), // wei
  paidSubmissionFee: z.string(), // wei
  verdictCid: z.string().optional()
})
export type MappedProtocolPublication = z.infer<typeof MappedProtocolPublicationSchema>

export const ProtocolPublicationMapper = (params: ProtocolPublication): MappedProtocolPublication => {
  const pub = {
    ...params,
    id: Number(params.id),
    stakes: formatEther(params.stakes),
    paidSubmissionFee: formatEther(params.paidSubmissionFee),
    status: STATUS_MAP[params.status]
  }

  return MappedProtocolPublicationSchema.parse(pub)
}