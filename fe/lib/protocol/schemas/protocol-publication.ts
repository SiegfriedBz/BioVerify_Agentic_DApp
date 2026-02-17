import { EthAddressSchema } from "@/app/_schemas/eth-address"
import { z } from "zod"

export const ProtocolPublicationStatusSchema = z.enum(["SUBMITTED", "IN_REVIEW", "SLASHED", "PUBLISHED"])
export type ProtocolPublicationStatus = z.infer<typeof ProtocolPublicationStatusSchema>

export const ProtocolPublicationSchema = z.object({
  id: z.bigint(),
  stakes: z.bigint(), // wei
  paidSubmissionFee: z.bigint(), // wei
  publisher: EthAddressSchema,
  reviewers: z.array(EthAddressSchema).catch([]),
  seniorReviewer: EthAddressSchema.optional(),
  cids: z.array(z.string()).min(1),
  status: ProtocolPublicationStatusSchema
})
export type ProtocolPublication = z.infer<typeof ProtocolPublicationSchema>

