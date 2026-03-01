'server-only'

import { ProtocolPublication, ProtocolPublicationSchema } from "@/app/_schemas/schemas/contract/protocol-publication"
import { getContractConfig } from "@/app/_utils/get-contract-config"
import { getClient } from "@/app/_utils/viem/get-client"
import { getNetworkFromCookies } from "@/app/_utils/wagmi/get-network-from-cookies"

type Params = {
  id: string
}

export const getPublicationDetails = async (params: Params): Promise<ProtocolPublication | null> => {
  const { id } = params

  const network = await getNetworkFromCookies()
  const contractConfig = getContractConfig(network)
  const { publicClient } = getClient(network)

  // readContract
  const result = await publicClient.readContract({
    ...contractConfig,
    functionName: 'getPublication',
    args: [BigInt(id)],
  })

  // Parse and Validate
  return ProtocolPublicationSchema.parse(result)
}
