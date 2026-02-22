'server-only'

import { HumanVerdictSchema, InterruptKind } from "@/app/_schemas/schemas/langchain/review"
import { recordReviewSubmission } from "@/app/api/contract/review/record-review-submission"
import { sendTelegramNotification } from "@/app/api/telegram/send-notification"
import { interrupt } from "@langchain/langgraph"
import { ReviewsState } from "../state"

/**
 * Pauses the graph and waits for a signed peer review.
 * Deduplicates incoming reviews and updates the persistent state.
 */
export const humanReviewsNode = async (state: ReviewsState): Promise<Partial<ReviewsState>> => {
  const { publicationId, humanReviews: persistedReviews } = state

  // Halt execution until 'resume' provides a review payload
  const payload = interrupt({ kind: InterruptKind.REVIEW_PUBLICATION }) as any
  const incomingReview = payload?.review

  // Validate verdict existence
  const parsed = HumanVerdictSchema.safeParse(incomingReview?.verdict)
  if (!parsed.success) return { humanReviews: persistedReviews }

  const incomingAddress = incomingReview.address.toLowerCase()

  // Prevent duplicate submissions from the same address
  const alreadyReviewed = persistedReviews.some(
    (r) => r.verdict && r.address.toLowerCase() === incomingAddress
  )
  if (alreadyReviewed) return { humanReviews: persistedReviews }

  // Record review submission on-chain
  await recordReviewSubmission({ publicationId, reviewerAddress: incomingAddress })

  // Notify the community
  const mask = (addr: string) => `\`${addr.slice(0, 6)}...${addr.slice(-4)}\``

  const message =
    `✍️ *BioVerify Alert: Review Submitted*\n\n` +
    `*Publication:* #${state.publicationId}\n` +
    `*Contributor:* ${mask(incomingAddress)}\n` +
    `*Status:* Review recorded on-chain\n\n` +
    `📥 The AI Agent has processed this submission. The final verdict will be generated once all assigned reviewers have contributed.\n\n` +
    `⏳ _Collectively securing scientific integrity..._`

  await sendTelegramNotification(message)

  // Replace placeholder with the full review
  const updatedReviews = [
    ...persistedReviews.filter((r) => r.address.toLowerCase() !== incomingAddress),
    incomingReview
  ]

  return { humanReviews: updatedReviews }
}