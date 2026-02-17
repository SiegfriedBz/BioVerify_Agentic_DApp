import { isAddress } from "viem"
import { z } from "zod"

// Supports both 0x (EVM) and sei1 (Native Sei)
export const EthAddressSchema = z.string().refine(
	(addr) => isAddress(addr) || /^sei1[a-z0-9]{38}$/.test(addr),
	{ message: "Must be a valid EVM (0x) or Sei Native (sei1) address" }
)
