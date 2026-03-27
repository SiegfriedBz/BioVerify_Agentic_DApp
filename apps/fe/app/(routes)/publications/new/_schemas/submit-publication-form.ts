import { EthAmountSchema, IpfsPublicationSchema } from "@packages/schema"
import type { z } from "zod"

// Submit Publication Form Schema
export const SubmitPublicationFormSchema = IpfsPublicationSchema.extend({
	stakeAmount: EthAmountSchema,
})

export type SubmitPublicationFormT = z.infer<typeof SubmitPublicationFormSchema>

