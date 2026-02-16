import { z } from "zod"

export const ProtocolReviewerAssignmentSchema = z.object({
  pubId: z.bigint(),
  cid: z.string(),
  isSeniorReviewer: z.boolean()
})

export type ProtocolReviewerAssignment = z.infer<typeof ProtocolReviewerAssignmentSchema>