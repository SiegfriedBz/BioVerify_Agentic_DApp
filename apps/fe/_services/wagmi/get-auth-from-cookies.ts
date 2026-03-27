'server-only'

import { NetworkSchema, NetworkT } from "@packages/schema"
import { ChainIdToNetwork } from "@packages/utils"
import { headers } from "next/headers"
import { cookieToInitialState, State } from "wagmi"
import { reownConfig } from "../../_config/wagmi/wagmi-config"

export const getAuthFromCookies = async (): Promise<{
  userAddress: string | null
  chainId: number | null
  network: NetworkT
}> => {
  const headerList = await headers()
  const cookie = headerList.get("cookie")

  const initialState: State | undefined = cookieToInitialState(reownConfig, cookie)

  const chainId = initialState?.chainId
  const currentConnectionId = initialState?.current
  const connection = currentConnectionId
    ? initialState?.connections.get(currentConnectionId)
    : null
  const address = connection?.accounts?.[0]

  return {
    userAddress: address?.toLowerCase() || null,
    chainId: chainId || null,
    network: chainId ? ChainIdToNetwork[chainId] : NetworkSchema.enum.base_sepolia
  }
}