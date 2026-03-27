import { z } from "zod"
import { PublicationSchema } from "./publication-ui"

// UI Data
export const PublicationsResponseSchema = z.object({
  items: z.array(PublicationSchema),
  totalCount: z.number()
})

export type PublicationsResponse = z.infer<typeof PublicationsResponseSchema>
