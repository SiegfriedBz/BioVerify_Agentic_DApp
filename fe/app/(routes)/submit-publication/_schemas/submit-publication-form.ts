import { IpfsPublicationSchema } from "@/app/_schemas/ipfs-publication"
import type { z } from "zod"
import { EthAmountSchema } from "./eth-amount"

// Submit Publication Form Schema
export const SubmitPublicationFormSchema = IpfsPublicationSchema.extend({
	stakeAmount: EthAmountSchema,
})

export type SubmitPublicationFormT = z.infer<typeof SubmitPublicationFormSchema>

