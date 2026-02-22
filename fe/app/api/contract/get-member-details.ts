'server-only'

import { ProtocolMember, ProtocolMemberSchema } from "@/app/_schemas/schemas/contract/protocol-member"
import { getContractConfig } from "@/app/_utils/get-contract-config"
import { getClient } from "@/app/_utils/viem/get-client"
import { getNetworkFromCookies } from "@/app/_utils/wagmi/get-network-from-cookies"

type Params = {
  address: `0x${string}`
}

export const getMemberDetails = async (params: Params): Promise<ProtocolMember> => {
  const { address } = params

  const network = await getNetworkFromCookies()
  const contractConfig = getContractConfig(network)
  const { publicClient } = getClient(network)

  // readContract
  const data = await publicClient.readContract({
    ...contractConfig,
    functionName: 'getMember',
    args: [address],
  })

  // Parse and Validate
  return ProtocolMemberSchema.parse(data)
}
