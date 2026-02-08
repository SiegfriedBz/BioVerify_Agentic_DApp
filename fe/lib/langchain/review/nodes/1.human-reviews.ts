'server-only'

import { interrupt } from "@langchain/langgraph"
import { InterruptKind, ReviewsState } from "../state"

export const humanReviewsNode = async (state: ReviewsState): Promise<Partial<ReviewsState>> => {
  const {
    humanReviews,
    minValidReviewsCount
  } = state

  // Check if we have enough valid reviews
  const validReviews = humanReviews.filter(r => r.reviewer.verdict)

  if (validReviews.length < minValidReviewsCount) {
    // PAUSE: Wait for the secure 'resume' call to add more
    interrupt({ kind: InterruptKind.REVIEW_PUBLICATION })
  }

  return {}
}


