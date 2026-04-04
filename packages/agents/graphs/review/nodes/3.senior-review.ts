import { interrupt } from "@langchain/langgraph"
import { recordReviewCommand } from "@packages/cqrs"
import {
	mask,
	networkMessage,
	sendTelegramNotification,
} from "@packages/notifications"
import { HumanVerdictSchema, InterruptKind } from "@packages/schema"
import "server-only"
import type { ReviewsState } from "../state"

/**
 * Handles AI-triggered escalation by pausing for a Senior Editor's verdict.
 */
export const seniorReviewNode = async (
	state: ReviewsState,
): Promise<Partial<ReviewsState>> => {
	// If already processed, move on
	if (state.seniorReview?.verdict) return {}

	// Pause and pass AI reasoning to the UI/Reviewer
	const payload = interrupt({
		kind: InterruptKind.SENIOR_REVIEW_PUBLICATION,
		llmVerdictReason: state.llmVerdict.reason,
	}) as any

	const incomingReview = payload?.review

	// Validate structure
	if (!HumanVerdictSchema.safeParse(incomingReview?.verdict).success) return {}

	// CQRS Command
	await recordReviewCommand({
		network: state.network,
		publicationId: state.publicationId,
		reviewerAddress: incomingReview.address,
	})

	// Notify the community
	const message =
		`👑 *BioVerify Alert: Senior Review Submitted*\n\n` +
		`*Network:* #${networkMessage(state.network)}\n` +
		`*Publication:* #${state.publicationId}\n` +
		`*Authority:* ${mask(incomingReview.address)}\n` +
		`*Status:* Senior verdict recorded on-chain\n\n` +
		`⚖️ This submission carries significant weight in the final publication decision. The AI Agent will now consolidate this with peer findings.\n\n` +
		`🏛️ _Scientific consensus in progress..._`

	await sendTelegramNotification(message)

	return { seniorReview: incomingReview }
}
