import { z } from "zod";
import { WalletSchema } from "./wallet";

export const AuthorRoleSchema = z.enum(["First_Author", "Contributor"]);

export const AuthorSchema = z.object({
	name: z.string().min(2),
	role: AuthorRoleSchema,
	wallet: WalletSchema.optional(),
});

export type Author = z.infer<typeof AuthorSchema>;
