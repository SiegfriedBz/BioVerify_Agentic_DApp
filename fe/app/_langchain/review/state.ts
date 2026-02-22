import { HumanReview, LlmVerdict } from "@/app/_schemas/schemas/langchain/review"
import { Annotation } from "@langchain/langgraph"

/**
 * Global state schema for the BioVerify Reviewer Agent.
 */
export const ReviewsStateAnnotation = Annotation.Root({
  publicationId: Annotation<string>,
  rootCid: Annotation<string>,

  // List of all assigned peer reviews
  humanReviews: Annotation<HumanReview[]>({
    reducer: (existing, incoming) => incoming,
    default: () => []
  }),

  // Current AI forensic audit verdict
  llmVerdict: Annotation<LlmVerdict>({
    reducer: (existing, incoming) => ({ ...existing, ...incoming }),
    default: () => ({ decision: "pending", reason: "" })
  }),

  // The senior reviewer's verdict (only populated during escalation)
  seniorReview: Annotation<HumanReview | null>({
    reducer: (existing, incoming) => incoming,
    default: () => null
  })
})

export type ReviewsState = typeof ReviewsStateAnnotation.State