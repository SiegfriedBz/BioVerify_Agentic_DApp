'server-only'

import { ProtocolPublication, ProtocolPublicationSchema } from "@/app/_schemas/schemas/contract/protocol-publication"
import { getContractConfig } from "@/app/_utils/get-contract-config"
import { getClient } from "@/app/_utils/viem/get-client"
import { getNetworkFromCookies } from "@/app/_utils/wagmi/get-network-from-cookies"

export const getPublications = async (): Promise<ProtocolPublication[]> => {
  const network = await getNetworkFromCookies()
  const contractConfig = getContractConfig(network)
  const { publicClient } = getClient(network)

  // 1. Get the total count
  const nextPubId = await publicClient.readContract({
    ...contractConfig,
    functionName: 'nextPubId',
  })

  const length = Number(nextPubId)
  if (length === 0) return []

  // 2. Prepare the batched calls
  const contracts = Array.from({ length }, (_, i) => ({
    ...contractConfig,
    functionName: 'getPublication',
    args: [BigInt(i)],
  }))

  // 3. Single RPC Request
  const results = await publicClient.multicall({
    contracts,
    allowFailure: true
  })

  // 4. Parse and Validate
  const data = results
    .filter((res: any) => res.status === "success")
    .map((res: any) => res.result)

  return data.map((d: any) => ProtocolPublicationSchema.parse(d))
}
