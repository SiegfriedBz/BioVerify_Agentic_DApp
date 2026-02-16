import { NetworkSchema, NetworkT } from "@/app/_schemas/network"

export const chainIdToNetwork: Record<number, NetworkT> = {
  11155111: NetworkSchema.enum.sepolia,
  1328: NetworkSchema.enum.sei_testnet
}