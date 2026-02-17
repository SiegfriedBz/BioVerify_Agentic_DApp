import { WalletSchema } from "@/app/_schemas/wallet"
import { z } from "zod"

export const AuthorRoleSchema = z.enum(["First_Author", "Contributor"])
type AuthorRole = z.infer<typeof AuthorRoleSchema>

export const AuthorRoleLabel: Record<AuthorRole, string> = {
	[AuthorRoleSchema.enum.First_Author]: "First Author",
	[AuthorRoleSchema.enum.Contributor]: "Contributor",
}

export const AuthorSchema = z.object({
	name: z.string().min(2),
	role: AuthorRoleSchema,
	wallet: WalletSchema.optional(),
})

export type Author = z.infer<typeof AuthorSchema>
