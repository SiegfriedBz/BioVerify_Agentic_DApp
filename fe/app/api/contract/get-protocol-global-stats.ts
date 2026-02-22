'server-only'

import { ProtocolGlobalStats, ProtocolGlobalStatsSchema } from "@/app/_schemas/schemas/contract/protocol-global-stats"
import { getContractConfig } from "@/app/_utils/get-contract-config"
import { getClient } from "@/app/_utils/viem/get-client"
import { getNetworkFromCookies } from "@/app/_utils/wagmi/get-network-from-cookies"

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
    { ...contractConfig, functionName: "getMembersCount" },
  ]

  const results = await publicClient.multicall({ contracts })

  const data = {
    rewardPool: results[0].status === "success" ? (results[0].result as bigint) : 0n,
    slashedPool: results[1].status === "success" ? (results[1].result as bigint) : 0n,
    nextPubId: results[2].status === "success" ? (results[2].result as bigint) : 0n,
    membersCount: results[3].status === "success" ? (results[3].result as bigint) : 0n,
  }

  return ProtocolGlobalStatsSchema.parse(data)
}
