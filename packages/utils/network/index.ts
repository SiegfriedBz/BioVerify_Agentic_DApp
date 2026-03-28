import { NetworkSchema, NetworkT } from "@packages/schema"

export const NetworkLabel: Record<NetworkT, string> = {
  [NetworkSchema.enum.eth_sepolia]: "Sepolia",
  [NetworkSchema.enum.base_sepolia]: "Base Sepolia",
}

export const NetworkToChainId: Record<NetworkT, number> = {
  [NetworkSchema.enum.eth_sepolia]: 11155111,
  [NetworkSchema.enum.base_sepolia]: 84532,
}

export const ChainIdToNetwork: Record<number, NetworkT> = {
  11155111: NetworkSchema.enum.eth_sepolia,
  84532: NetworkSchema.enum.base_sepolia
}