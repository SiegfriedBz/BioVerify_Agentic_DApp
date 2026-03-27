import { z } from "zod"

export const ReviewerRoleSchema = z.enum(["senior", "peer"])
export type ReviewerRole = z.infer<typeof ReviewerRoleSchema>
