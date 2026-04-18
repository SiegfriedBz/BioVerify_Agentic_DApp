import { Annotation } from "@langchain/langgraph"
import type { HumanReview, LlmVerdict, NetworkT } from "@packages/schema"

/**
 * Global state schema for the BioVerify Reviewer Agent.
 */
export const ReviewsStateAnnotation = Annotation.Root({
	network: Annotation<NetworkT>,
	publicationId: Annotation<string>,
	rootCid: Annotation<string>,

	// List of all assigned peer reviews
	humanReviews: Annotation<HumanReview[]>({
		reducer: (_existing, incoming) => incoming,
		default: () => [],
	}),

	// Current AI forensic audit verdict
	llmVerdict: Annotation<LlmVerdict>({
		reducer: (existing, incoming) => ({ ...existing, ...incoming }),
		default: () => ({ decision: "pending", reason: "" }),
	}),

	// The senior reviewer's verdict (only populated during escalation)
	seniorReview: Annotation<HumanReview>({
		reducer: (_existing, incoming) => incoming,
		default: () => ({ address: "" }),
	}),
})

export type ReviewsState = typeof ReviewsStateAnnotation.State
