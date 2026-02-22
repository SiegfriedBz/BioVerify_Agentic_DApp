'server-only'

import { getContractConfig } from "@/app/_utils/get-contract-config"
import { getClient } from "@/app/_utils/viem/get-client"
import { getNetworkFromCookies } from "@/app/_utils/wagmi/get-network-from-cookies"
import { Address } from "viem"

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
