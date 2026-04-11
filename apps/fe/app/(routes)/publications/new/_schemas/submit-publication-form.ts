import { EthAmountSchema, IpfsPublicationSchema } from "@packages/schema"
import type { z } from "zod"

// Submit Publication Form Schema
export const SubmitPublicationFormSchema = IpfsPublicationSchema.extend({
	stakeAmount: EthAmountSchema,
})

export type SubmitPublicationFormT = z.infer<typeof SubmitPublicationFormSchema>
/** Use for `react-hook-form` values; avoids output-only brands (e.g. `0x${string}`) on `address`. */
export type SubmitPublicationFormValues = z.input<
	typeof SubmitPublicationFormSchema
>
