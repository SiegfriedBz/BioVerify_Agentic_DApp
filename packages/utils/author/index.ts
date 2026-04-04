import { type AuthorRole, AuthorRoleSchema } from "@packages/schema"

export const AuthorRoleLabel: Record<AuthorRole, string> = {
	[AuthorRoleSchema.enum.First_Author]: "First Author",
	[AuthorRoleSchema.enum.Contributor]: "Contributor",
}
