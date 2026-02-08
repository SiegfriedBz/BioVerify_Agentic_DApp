'server-only'

import { interrupt } from "@langchain/langgraph"
import { InterruptKind, ReviewsState } from "../state"

export const seniorReviewNode = async (state: ReviewsState): Promise<Partial<ReviewsState>> => {
  const { seniorReview } = state

  // If the resume has already provided a verdict, the graph continues
  if (seniorReview?.reviewer?.verdict) {
    return {}
  }

  // Else: Wait for the senior reviewer's signature/verdict
  interrupt({
    kind: InterruptKind.SENIOR_REVIEW_PUBLICATION,
    llmVerdictReason: state.llmVerdict.reason // Pass the AI's reasoning for why it escalated
  })

  return {}
}