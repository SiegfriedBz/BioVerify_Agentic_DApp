import { db } from "@packages/db"
import { mapProtocol, type Protocol, protocolDbSchema } from "@packages/schema"
import { eq } from "drizzle-orm"

type Params = {
  chainId: number | null
}

/**
 * Fetches protocol configuration
 */
export async function getProtocolByChain(params: Params): Promise<Protocol | null> {
  const { chainId } = params

  if (!chainId) return null

  try {
    const [raw] = await db
      .select()
      .from(protocolDbSchema)
      .where(eq(protocolDbSchema.id, chainId.toString()))
      .limit(1)

    if (!raw) return null

    return mapProtocol(raw)
  } catch (error) {
    console.error(`[CQRS] getProtocolByChain Failed for chain ${chainId}:`, error)
    return null
  }
}