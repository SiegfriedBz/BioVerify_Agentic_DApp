import { z } from "zod"

export const NetworkSchema = z.enum(["sepolia", "sei_testnet"])
export type NetworkT = z.infer<typeof NetworkSchema>

export const NetworkLabel: Record<NetworkT, string> = {
	[NetworkSchema.enum.sepolia]: "Sepolia",
	[NetworkSchema.enum.sei_testnet]: "Sei Testnet",
}
