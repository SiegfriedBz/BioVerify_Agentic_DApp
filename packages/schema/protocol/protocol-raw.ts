import { createSelectSchema } from 'drizzle-zod'
import { z } from "zod"
import { protocolDbSchema } from "../db"

// RAW Data (DB)
export const ProtocolRawSchema = createSelectSchema(protocolDbSchema)
export type ProtocolRaw = z.infer<typeof ProtocolRawSchema>