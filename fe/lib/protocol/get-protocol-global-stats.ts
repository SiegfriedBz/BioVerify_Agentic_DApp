'server-only'

import { getContractConfig } from "../utils/get-contract-config"
import { getNetworkFromCookies } from "../wagmi/get-network-from-cookies"
import { ProtocolGlobalStats, ProtocolGlobalStatsSchema } from "./schemas/protocol-global-stats"
import { sleep } from "./utils/sleep"
import { getClient } from "./utils/viem-client"

/**
 * @name getProtocolGlobalStats
 * @description Fetches global protocol metrics using a single multicall.
 */
export const getProtocolGlobalStats = async (): Promise<ProtocolGlobalStats> => {
  const network = await getNetworkFromCookies()
  const { publicClient } = getClient(network)
  const contractConfig = getContractConfig(network)

  const contracts = [
    { ...contractConfig, functionName: "rewardPool" },
    { ...contractConfig, functionName: "slashedPool" },
    { ...contractConfig, functionName: "nextPubId" },
    // TODO add getMemberCount in contract
    { ...contractConfig, functionName: "getMemberCount" },
  ]

  const results = await publicClient.multicall({ contracts })

  const data = {
    rewardPool: results[0].status === "success" ? (results[0].result as bigint) : 0n,
    slashedPool: results[1].status === "success" ? (results[1].result as bigint) : 0n,
    nextPubId: results[2].status === "success" ? (results[2].result as bigint) : 0n,
    memberCount: results[3].status === "success" ? (results[3].result as bigint) : 0n,
  }

  return ProtocolGlobalStatsSchema.parse(data)
}

// Mock 
export const getProtocolGlobalStatsMock = async () => {
  await sleep()

  return ProtocolGlobalStatsSchema.parse({
    rewardPool: 1n,
    slashedPool: 2n,
    nextPubId: 20n,
    memberCount: 42n,
  })
}