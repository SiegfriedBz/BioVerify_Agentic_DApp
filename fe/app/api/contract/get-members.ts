'server-only'

import { ProtocolMember, ProtocolMemberSchema } from "@/app/_schemas/schemas/contract/protocol-member"
import { getContractConfig } from "@/app/_utils/get-contract-config"
import { getClient } from "@/app/_utils/viem/get-client"
import { getNetworkFromCookies } from "@/app/_utils/wagmi/get-network-from-cookies"

type Params = {
  addresses: `0x${string}`[]
}

export const getMembers = async (params: Params): Promise<ProtocolMember[]> => {
  const { addresses } = params

  const network = await getNetworkFromCookies()
  const contractConfig = getContractConfig(network)
  const { publicClient } = getClient(network)

  const length = addresses.length
  if (length === 0) return []

  // 1. Prepare the batched calls
  const contracts = Array.from({ length }, (address) => ({
    ...contractConfig,
    functionName: 'addressToMember',
    args: [address],
  }))

  // 2. Single RPC Request
  const results = await publicClient.multicall({
    contracts,
    allowFailure: true
  })

  // 3. Parse and Validate
  return results
    .filter((res: any) => res.status === "success")
    .map((res: any) => ProtocolMemberSchema.parse(res.result))
}
