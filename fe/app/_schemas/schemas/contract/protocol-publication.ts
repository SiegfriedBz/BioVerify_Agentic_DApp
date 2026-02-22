
import { z } from "zod"
import { EthAddressSchema } from "../eth-address"

export const ProtocolPublicationStatusSchema = z.enum(["SUBMITTED", "IN_REVIEW", "SLASHED", "PUBLISHED"])
export type ProtocolPublicationStatus = z.infer<typeof ProtocolPublicationStatusSchema>

export const ProtocolPublicationSchema = z.object({
  id: z.bigint(),
  stakes: z.bigint(), // wei
  paidSubmissionFee: z.bigint(), // wei
  publisher: EthAddressSchema,
  reviewers: z.array(EthAddressSchema).catch([]),
  seniorReviewer: EthAddressSchema.optional(),
  cids: z.array(z.string()).catch([]),
  status: z.number().min(0).max(ProtocolPublicationStatusSchema.options.length - 1), // 0 1 2 3 ,
  verdictCid: z.string().optional()
})
export type ProtocolPublication = z.infer<typeof ProtocolPublicationSchema>

