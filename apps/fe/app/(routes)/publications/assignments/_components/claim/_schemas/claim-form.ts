import { EthAmountSchema } from "@packages/schema"
import { z } from "zod"

export const ClaimFormSchema = z.object({
	amount: EthAmountSchema,
})

export type ClaimFormSchemaT = z.infer<typeof ClaimFormSchema>
export type ClaimFormSchemaValues = z.input<typeof ClaimFormSchema>
