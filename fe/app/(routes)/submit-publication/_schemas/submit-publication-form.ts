import { EthAmountSchema } from "@/app/_schemas/schemas/eth-amount"
import { IpfsPublicationSchema } from "@/app/_schemas/schemas/ipfs-publication"
import type { z } from "zod"

// Submit Publication Form Schema
export const SubmitPublicationFormSchema = IpfsPublicationSchema.extend({
	stakeAmount: EthAmountSchema,
})

export type SubmitPublicationFormT = z.infer<typeof SubmitPublicationFormSchema>

