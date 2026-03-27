import { db } from "@packages/db"
import { mapProtocol, type Protocol, protocolDbSchema } from "@packages/schema"

/**
 * Fetches all protocol configurations across all supported chains.
 */
export async function getProtocols(): Promise<Protocol[]> {
  try {
    const rawData = await db.select().from(protocolDbSchema)

    return rawData.reduce((acc: Protocol[], raw) => {
      try {
        acc.push(mapProtocol(raw))
      } catch (e) {
        console.error(`[CQRS] Failed to map protocol ${raw.id}:`, e)
      }
      return acc
    }, [])
  } catch (error) {
    console.error("[CQRS] getProtocols Error:", error)
    return []
  }
}