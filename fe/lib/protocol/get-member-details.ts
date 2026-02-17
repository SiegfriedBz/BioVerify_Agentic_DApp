'server-only'

import { getContractConfig } from "../utils/get-contract-config"
import { getNetworkFromCookies } from "../wagmi/get-network-from-cookies"
import { ProtocolMember, ProtocolMemberSchema } from "./schemas/protocol-member"
import { sleep } from "./utils/sleep"
import { getClient } from "./utils/viem-client"

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
    functionName: 'addressToMember',
    args: [address],
  })

  // Parse and Validate
  return ProtocolMemberSchema.parse(data)
}

// Mock
export const getMemberDetailsMock = async (): Promise<ProtocolMember> => {
  await sleep()

  const member = {
    memberAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    stakes: BigInt(Math.floor(Math.random() * 500)) * 10n ** 18n,
    paidSubmissionFee: 15n,
    publishedPublicationsIds: [
      0n, 1n
    ],
    isReviewer: true,
    reputation: BigInt(Math.floor(Math.random() * 500)) * 10n ** 18n,
  }

  return ProtocolMemberSchema.parse(member)
}