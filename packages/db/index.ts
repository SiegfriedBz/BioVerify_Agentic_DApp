import { neon } from "@neondatabase/serverless"
import { env } from "@packages/env"
import * as dbSchema from '@packages/schema/db'
import { drizzle } from "drizzle-orm/neon-http"
import "server-only"

const client = neon(env.NEON_DATABASE_URL)

export const db = drizzle(client, { schema: dbSchema })
