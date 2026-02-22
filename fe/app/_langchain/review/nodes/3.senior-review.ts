'server-only'

import { HumanVerdictSchema, InterruptKind } from "@/app/_schemas/schemas/langchain/review"
import { recordReviewSubmission } from "@/app/api/contract/review/record-review-submission"
import { sendTelegramNotification } from "@/app/api/telegram/send-notification"
import { interrupt } from "@langchain/langgraph"
import { ReviewsState } from "../state"

/**
 * Handles AI-triggered escalation by pausing for a Senior Editor's verdict.
 */
export const seniorReviewNode = async (state: ReviewsState): Promise<Partial<ReviewsState>> => {
  // If already processed, move on
  if (state.seniorReview?.verdict) return {}

  // Pause and pass AI reasoning to the UI/Reviewer
  const payload = interrupt({
    kind: InterruptKind.SENIOR_REVIEW_PUBLICATION,
    llmVerdictReason: state.llmVerdict.reason
  }) as any

  const incomingReview = payload?.review

  // Validate structure
  if (!HumanVerdictSchema.safeParse(incomingReview?.verdict).success) return {}

  // Record review submission on-chain
  await recordReviewSubmission({ publicationId: state.publicationId, reviewerAddress: incomingReview.address })

  // Notify the community
  const mask = (addr: string) => `\`${addr.slice(0, 6)}...${addr.slice(-4)}\``

  const message =
    `👑 *BioVerify Alert: Senior Review Submitted*\n\n` +
    `*Publication:* #${state.publicationId}\n` +
    `*Authority:* ${mask(incomingReview.address)}\n` +
    `*Status:* Senior verdict recorded on-chain\n\n` +
    `⚖️ This submission carries significant weight in the final publication decision. The AI Agent will now consolidate this with peer findings.\n\n` +
    `🏛️ _Scientific consensus in progress..._`

  await sendTelegramNotification(message)

  return { seniorReview: incomingReview }
}