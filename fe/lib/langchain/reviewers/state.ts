import { Annotation } from "@langchain/langgraph"
import { z } from "zod"

export enum InterruptKind {
  REVIEW_PUBLICATION = "REVIEW_PUBLICATION",
  SENIOR_REVIEW_PUBLICATION = "SENIOR_REVIEW_PUBLICATION",
}
export const HumanDecisionSchema = z.enum(["pass", "fail"])
export const LlmDecisionSchema = z.enum(["pass", "fail", "pending", "escalate"])

export const HumanVerdictSchema = z.object({
  decision: HumanDecisionSchema,
  reason: z.string()
})
export type HumanVerdict = z.infer<typeof HumanVerdictSchema>

export const LlmVerdictSchema = z.object({
  decision: LlmDecisionSchema,
  reason: z.string()
})
export type LlmVerdict = z.infer<typeof LlmVerdictSchema>

const HumanReviewSchema = z.object({
  reviewer: z.object({
    address: z.string(),
    verdict: HumanVerdictSchema.optional()
  })
})
export type HumanReview = z.infer<typeof HumanReviewSchema>

export const HumanFullReviewSchema = z.object({
  reviewer: z.object({
    address: z.string(),
    verdict: HumanVerdictSchema
  })
})
export type HumanFullReview = z.infer<typeof HumanFullReviewSchema>


export const ReviewsStateAnnotation = Annotation.Root({
  publicationId: Annotation<string>,
  rootCid: Annotation<string>,

  minValidReviewsCount: Annotation<number>,

  // Logic: Only allow a review if the address isn't already in the list
  humanReviews: Annotation<HumanReview[]>({
    reducer: (existing, incoming) => {
      const updated = [...existing]
      incoming.forEach(newReview => {
        const alreadySubmitted = updated.some(
          r => r.reviewer.address.toLowerCase() === newReview.reviewer.address.toLowerCase()
            && r.reviewer.verdict // Check if they actually provided a verdict previously
        )

        if (!alreadySubmitted) {
          // If the address exists but has no verdict (initial state), update it.
          const idx = updated.findIndex(r => r.reviewer.address.toLowerCase() === newReview.reviewer.address.toLowerCase())
          if (idx !== -1) {
            updated[idx] = newReview
          } else {
            // If the address doesn't exist at all, push it.
            updated.push(newReview)
          }
        }
      })
      return updated
    },
    default: () => [],
  }),


  // AI Verdict (with a reducer because we need it before and potentially after seniorReview)
  llmVerdict: Annotation<LlmVerdict>({
    reducer: (existing, incoming) => ({ ...existing, ...incoming }),
    default: () => ({ decision: "pending", reason: "" })
  }),

  // Senior Reviewer (required only on escalation)
  seniorReview: Annotation<HumanReview | null>({
    reducer: (existing, incoming) => incoming,
    default: () => null
  })
})

export type ReviewsState = typeof ReviewsStateAnnotation.State

