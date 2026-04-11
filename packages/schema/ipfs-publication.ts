import { z } from "zod"
import { AuthorSchema } from "./author"

export const FileTypeSchema = z.enum(["image", "data", "code"])

export const FileSchema = z.object({
	name: z
		.string()
		.min(1, "Give this attachment a short label so you can recognize it."),
	type: FileTypeSchema,
	file: z.any(), // File object from <input type="file">
})

export type FileT = z.infer<typeof FileSchema>

// IPFS PublicationSchema
export const IpfsPublicationSchema = z.object({
	title: z.string().min(10, "Add a clear title with at least 10 characters."),
	abstract: z
		.string()
		.min(50, "The abstract should be at least 50 characters."),
	authors: z
		.array(AuthorSchema)
		.min(1, "Add at least one author with their name and wallet details."),
	license: z.string().optional(),
	manuscript: z
		.string()
		.min(100, "The manuscript should be at least 100 characters."),

	// Files are handled as Blobs/Files in the browser before upload
	files: z.array(FileSchema).optional(),
})

export type IpfsPublication = z.infer<typeof IpfsPublicationSchema>
