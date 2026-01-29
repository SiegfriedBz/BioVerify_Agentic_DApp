import { z } from "zod";

export const NetworkSchema = z.enum([
	"sei_testnet",
	"sei_mainnet",
	"sepolia",
	"ethereum",
]);

export const WalletSchema = z.object({
	// Supports both 0x (EVM) and sei1 (Native Sei)
	address: z.string().refine(
		(addr) => {
			const isEvm = /^0x[a-fA-F0-9]{40}$/.test(addr);
			const isSeiNative = /^sei1[a-z0-9]{38}$/.test(addr);
			return isEvm || isSeiNative;
		},
		{
			message:
				"Address must be a valid EVM (0x...) or Sei Native (sei1...) address",
		},
	),

	// Chain identifier to distinguish between networks
	network: NetworkSchema,
});
