import { z } from "zod";
import { AuthorSchema } from "./author";

// The Manifest Schema
// "Root Object" that the BioVerify Smart Contract points to.
export const ManifestSchema = z.object({
	version: z.string().default("1.0.0"),
	metadata: z.object({
		title: z.string(),
		abstract: z.string(),
		authors: z.array(AuthorSchema),
		license: z.string(),
	}),
	payload: z.object({
		manuscriptCid: z.string(), // CID of the text
		attachments: z.array(
			z.object({
				name: z.string(),
				type: z.string(),
				cid: z.string(), // CID of the image/csv/etc
			}),
		),
	}),
});
