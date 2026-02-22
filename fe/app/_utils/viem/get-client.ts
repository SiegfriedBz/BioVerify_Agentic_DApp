'server-only'

import { seiAgentClient, seiPublicClient, sepoliaAgentClient, sepoliaPublicClient } from "@/app/_config/viem/viem-config"
import { NetworkSchema, NetworkT } from "@/app/_schemas/schemas/network"

/**
 * HELPER: Get Viem Client by network
 */
export const getClient = (network: NetworkT) => {
  if (network === NetworkSchema.enum.sepolia) return { publicClient: sepoliaPublicClient, agentClient: sepoliaAgentClient }
  if (network === NetworkSchema.enum.sei_testnet) return { publicClient: seiPublicClient, agentClient: seiAgentClient }

  throw new Error("Unsupported Chain ID")
}
