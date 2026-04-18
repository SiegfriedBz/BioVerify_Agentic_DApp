import { Command } from "@langchain/langgraph"
import type { HumanFullReview, NetworkT } from "@packages/schema"
import { verifyRewiewEip712 } from "@packages/utils-server"
import "server-only"
import { reviewersGraph } from "./graph"

type Params = {
	threadId: string
	network: NetworkT
	review: HumanFullReview
	signature: `0x${string}`
}

/**
 * Validates and injects a Senior Editor's verdict to resolve an escalation.
 */
export const resumeSeniorReviewerAgent = async (params: Params) => {
	const { threadId, network, review, signature } = params
	const config = { configurable: { thread_id: threadId } }

	// 1. Cryptographic Verification (EIP-712)
	const isValid = await verifyRewiewEip712({
		network,
		threadId,
		review,
		signature,
	})
	if (!isValid)
		throw new Error("Unauthorized: Cryptographic signature is invalid.")

	// 2. Fetch Current State
	const state = await reviewersGraph.getState(config)

	console.log("PRODUCTION_AUTH_CHECK:", {
		signer: review.address.toLowerCase(),
		storedReviews: state.values?.humanReviews,
		seniorReview: state.values?.seniorReview?.address?.toLowerCase(),
		allStateKeys: Object.keys(state.values || {}),
	})

	// 3. Authorization Check
	const assignedSenior = state.values?.seniorReview?.address
	if (assignedSenior?.toLowerCase() !== review.address.toLowerCase()) {
		throw new Error(
			"Forbidden: Address not assigned as Senior Reviewer for this publication.",
		)
	}

	// 4. Sequence Guard
	// Ensure the AI has actually reached the escalation phase.
	const isEscalated = state.values?.llmVerdict?.decision === "escalate"
	if (!isEscalated) {
		throw new Error(
			"Action Not Allowed: The protocol has not escalated this publication to a Senior Reviewer.",
		)
	}

	// 5. Resume Graph
	return await reviewersGraph.invoke(
		new Command({
			resume: { review },
		}),
		config,
	)
}
