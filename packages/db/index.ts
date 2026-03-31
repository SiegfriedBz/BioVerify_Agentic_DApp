import { neon, NeonQueryFunction } from "@neondatabase/serverless"
import { env } from "@packages/env"
import * as dbSchema from '@packages/schema/db'
import { drizzle } from "drizzle-orm/neon-http"
import "server-only"

const globalForDb = globalThis as unknown as {
  conn: NeonQueryFunction<boolean, boolean> | undefined
}

const connection = globalForDb.conn ?? neon(env.NEON_DATABASE_URL)

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = connection
}

export const db = drizzle(connection, { schema: dbSchema })
