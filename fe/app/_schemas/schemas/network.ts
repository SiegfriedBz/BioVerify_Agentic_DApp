import { z } from "zod"

export const NetworkSchema = z.enum(["sepolia", "sei_testnet"])
export type NetworkT = z.infer<typeof NetworkSchema>

export const NetworkLabel: Record<NetworkT, string> = {
	[NetworkSchema.enum.sepolia]: "Sepolia",
	[NetworkSchema.enum.sei_testnet]: "Sei Testnet",
}

export const NetworkToChainId: Record<NetworkT, number> = {
	[NetworkSchema.enum.sepolia]: 11155111,
	[NetworkSchema.enum.sei_testnet]: 1328,
}

export const chainIdToNetwork: Record<number, NetworkT> = {
	11155111: NetworkSchema.enum.sepolia,
	1328: NetworkSchema.enum.sei_testnet
}