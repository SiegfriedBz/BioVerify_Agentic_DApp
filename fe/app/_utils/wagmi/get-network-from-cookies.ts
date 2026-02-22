'server-only'

import { reownConfig } from "@/app/_config/wagmi/wagmi-config"
import { chainIdToNetwork, NetworkSchema } from "@/app/_schemas/schemas/network"
import { headers } from "next/headers"
import { cookieToInitialState } from "wagmi"

export const getNetworkFromCookies = async () => {
  const headerList = await headers()
  const cookie = headerList.get("cookie")

  // This helper from Wagmi parses the cookie and returns the connection state
  const initialState = cookieToInitialState(reownConfig, cookie)

  const chainId = initialState?.chainId

  return chainId ? chainIdToNetwork[chainId] : NetworkSchema.enum.sepolia
}