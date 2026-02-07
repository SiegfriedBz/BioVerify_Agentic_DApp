import { PublicationSchema } from "@/app/_schemas/publication"
import { StateSchema } from "@langchain/langgraph"
import { z } from "zod"

export const VerdictSchema = z.object({
	decision: z.enum(["pass", "fail", "pending"]).default("pending"),
	reason: z.string().optional()
})

const SubmissionBase = {
	publicationId: z.string(),
	rootCid: z.string(),
	verdict: VerdictSchema,
	// the raw publication abstract fetched from IPFS
	publication: PublicationSchema.pick({
		abstract: true,
	}).optional(),
	// the sources fetched by tavily
	sources: z.array(z.any()).prefault([])
}

export const SubmissionSchema = z.object(SubmissionBase)

// https://docs.langchain.com/oss/javascript/langgraph/graph-api#working-with-messages-in-graph-state
export const SubmissionStateSchema = new StateSchema(SubmissionBase)
export type SubmissionState = typeof SubmissionStateSchema.State
