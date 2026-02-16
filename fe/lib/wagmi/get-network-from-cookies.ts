'server-only'

import { NetworkSchema } from "@/app/_schemas/network"
import { headers } from "next/headers"
import { cookieToInitialState } from "wagmi"
import { chainIdToNetwork } from "../chainId-to-network"
import { reownConfig } from "./config"

export const getNetworkFromCookies = async () => {
  const headerList = await headers()
  const cookie = headerList.get("cookie")

  // This helper from Wagmi parses the cookie and returns the connection state
  const initialState = cookieToInitialState(reownConfig, cookie)

  const chainId = initialState?.chainId

  return chainId ? chainIdToNetwork[chainId] : NetworkSchema.enum.sepolia
}