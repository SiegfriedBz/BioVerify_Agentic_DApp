import { z } from "zod";
import { AuthorSchema } from "./author";

const MetadataSchema = z.object({
	authors: z.array(AuthorSchema),
	license: z.string().optional(),
});

const AttachementSchema = z.object({
	name: z.string(),
	type: z.string(),
	cid: z.string(), // CID of the image/csv/etc
});

// The Manifest Schema
// "Root Object" that the BioVerify Smart Contract points to.
export const ManifestSchema = z.object({
	metadata: MetadataSchema,
	payload: z.object({
		titleCid: z.string(), // CID of the text
		abstractCid: z.string(), // CID of the text
		manuscriptCid: z.string(), // CID of the text
		attachments: z.array(AttachementSchema),
	}),
});
