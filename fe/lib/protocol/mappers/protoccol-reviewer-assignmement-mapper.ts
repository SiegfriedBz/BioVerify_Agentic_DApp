import { z } from "zod"
import { ProtocolReviewerAssignment } from "../schemas/protoccol-reviewer-assignmement"

export const MappedProtocolReviewerAssignmentSchema = z.object({
  pubId: z.number(),
  cid: z.string(),
  isSeniorReviewer: z.boolean()
})
export type MappedProtocolReviewerAssignment = z.infer<typeof MappedProtocolReviewerAssignmentSchema>

export const ProtocolReviewerAssignmentMapper = (params: ProtocolReviewerAssignment): MappedProtocolReviewerAssignment => {
  const assignement = {
    ...params,
    pubId: Number(params.pubId),
  }

  return MappedProtocolReviewerAssignmentSchema.parse(assignement)
}