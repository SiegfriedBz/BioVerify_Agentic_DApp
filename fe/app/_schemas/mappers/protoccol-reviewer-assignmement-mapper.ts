import { z } from "zod"
import { ProtocolReviewerAssignment } from "../schemas/contract/protoccol-reviewer-assignmement"
import { EthAddressSchema } from "../schemas/eth-address"

export const MappedProtocolReviewerAssignmentSchema = z.object({
  pubId: z.number(),
  cid: z.string(),
  isSeniorReviewer: z.boolean(),
  address: EthAddressSchema
})
export type MappedProtocolReviewerAssignment = z.infer<typeof MappedProtocolReviewerAssignmentSchema>

type Params = ProtocolReviewerAssignment & { address: `0x${string}` }
export const ProtocolReviewerAssignmentMapper = (params: Params): MappedProtocolReviewerAssignment => {
  const assignement = {
    ...params,
    pubId: Number(params.pubId),
  }

  return MappedProtocolReviewerAssignmentSchema.parse(assignement)
}