import { createSelectSchema } from "drizzle-zod"
import type { z } from "zod"
import { memberDbSchema } from "../db"

// RAW Data (DB)
export const MemberRawSchema = createSelectSchema(memberDbSchema)
export type MemberRaw = z.infer<typeof MemberRawSchema>
