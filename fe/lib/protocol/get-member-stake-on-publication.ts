'server-only'

import { Address } from "viem"
import { getNetworkFromCookies } from "../wagmi/get-network-from-cookies"
import { sleep } from "./utils/sleep"
import { getClient, getContractConfig } from "./utils/viem-client"

type Params = {
  memberAddress: Address,
  pubId: number
}

export const getMemberStakeOnPublication = async (params: Params): Promise<bigint> => {
  const {
    memberAddress,
    pubId
  } = params

  const network = await getNetworkFromCookies()
  const { publicClient } = getClient(network)
  const contractConfig = getContractConfig(network)

  const stake = await publicClient.readContract({
    ...contractConfig,
    functionName: "memberStakeOnPubId",
    args: [memberAddress, BigInt(pubId)],
  })

  return stake as bigint
}

// Mock
export const getMemberStakeOnPublicationMock = async (): Promise<bigint> => {
  await sleep()

  return 2000n
}