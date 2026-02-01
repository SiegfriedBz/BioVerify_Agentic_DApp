import { parseEther } from "viem";
import { z } from "zod";

export const EthAmountSchema = z
	.string()
	.min(1, "Amount is required")
	.refine(
		(val) => {
			try {
				parseEther(val);
				return parseEther(val) > 0n;
			} catch {
				return false;
			}
		},
		{
			message: "Invalid ETH amount",
		},
	);

export type EthAmount = z.infer<typeof EthAmountSchema>;
