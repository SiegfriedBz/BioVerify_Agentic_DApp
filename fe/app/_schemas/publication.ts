import { z } from "zod"
import { AuthorSchema } from "./author"

export const FileTypeSchema = z.enum(["image", "data", "code"])

export const FileSchema = z.object({
	name: z.string(),
	type: FileTypeSchema,
	file: z.any(), // File object from <input type="file">
})

export type FileT = z.infer<typeof FileSchema>

// PublicationSchema
export const PublicationSchema = z.object({
	title: z.string().min(10),
	abstract: z.string().min(50),
	authors: z.array(AuthorSchema).min(1),
	license: z.string().optional(),
	manuscript: z.string().min(100),

	// Files are handled as Blobs/Files in the browser before upload
	files: z.array(FileSchema).optional(),
})

export type Publication = z.infer<typeof PublicationSchema>
