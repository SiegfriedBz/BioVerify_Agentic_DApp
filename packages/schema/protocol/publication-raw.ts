import { createSelectSchema } from "drizzle-zod"
import { z } from "zod"
import { publicationDbSchema } from "../db"

export const PublicationStatusSchema = z.enum([
  "SUBMITTED",      // 0
  "EARLY_SLASHED",  // 1
  "IN_REVIEW",      // 2
  "SLASHED",        // 3
  "PUBLISHED"       // 4
])
export type PublicationStatus = z.infer<typeof PublicationStatusSchema>

// RAW Data (DB)
export const PublicationRawSchema = createSelectSchema(publicationDbSchema)
export type PublicationRaw = z.infer<typeof PublicationRawSchema>
