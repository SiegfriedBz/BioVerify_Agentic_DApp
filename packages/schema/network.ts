import { z } from "zod"

export const NetworkSchema = z.enum(["eth_sepolia", "base_sepolia"])
export type NetworkT = z.infer<typeof NetworkSchema>
