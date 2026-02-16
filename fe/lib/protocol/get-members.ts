'server-only'

import { getNetworkFromCookies } from "../wagmi/get-network-from-cookies"
import { ProtocolMember, ProtocolMemberSchema } from "./schemas/protocol-member"
import { sleep } from "./utils/sleep"
import { getClient, getContractConfig } from "./utils/viem-client"

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
    .filter((res) => res.status === "success")
    .map((res) => ProtocolMemberSchema.parse(res.result))
}

// Mock
export const getMembersMock = async (): Promise<ProtocolMember[]> => {
  await sleep()

  const members = Array.from({ length: 15 }, (_, i) => {
    return {
      memberAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      stakes: BigInt(Math.floor(Math.random() * 500)) * 10n ** 18n,
      paidSubmissionFee: 15n,
      publishedPublicationsIds: [
        0n, 1n
      ],
      isReviewer: true,
      reputation: BigInt(Math.floor(Math.random() * 500)),
    }
  })

  return members.map((res) => ProtocolMemberSchema.parse(res))
}