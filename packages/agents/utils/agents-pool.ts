import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres"
import { env } from "@packages/env"
import { Pool } from "pg"
import 'server-only'

/**
 * AGENT STATE SINGLETON
 */
const globalForPg = global as unknown as {
  pool: Pool | undefined,
  checkpointer: PostgresSaver | undefined
}

// 1. Initialize the Pool
const pool = globalForPg.pool ?? new Pool({
  connectionString: env.NEON_AGENTS_DATABASE_URL,
  max: 10, // low for Neon serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// 2. Initialize the Checkpointer
const pgCheckpointer = globalForPg.checkpointer ?? new PostgresSaver(pool)

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pool = pool
  globalForPg.checkpointer = pgCheckpointer
}

export default pgCheckpointer