"use client"

import { useConnections, UseConnectionsReturnType } from "wagmi"

export const useAuthFromWallet = () => {
  const connections: UseConnectionsReturnType = useConnections()
  const connection = connections?.at(0)
  const walletAddress = connection?.accounts?.at(0)
  const walletChainId = connection?.chainId

  return { walletAddress, walletChainId }
}
