import { Command } from "@langchain/langgraph"
import { HumanFullReview, HumanReview, NetworkT } from "@packages/schema"
import { verifyRewiewEip712 } from "@packages/utils-server"
import 'server-only'
import { reviewersGraph } from "./graph"

type Params = {
	threadId: string
	network: NetworkT
	review: HumanFullReview
	signature: `0x${string}`
}

/**
 * Validates and injects a human peer review into the active graph execution.
 */
export const resumeReviewersAgent = async (params: Params) => {
	const { threadId, network, review, signature } = params
	const config = { configurable: { thread_id: threadId } }

	// 1. Cryptographic Verification (EIP-712)
	const isValid = await verifyRewiewEip712({ network, threadId, review, signature })
	if (!isValid) throw new Error("Unauthorized: Cryptographic signature is invalid.")

	// 2. Authorization Check
	// Fetch persisted state to ensure the signer is an assigned reviewer
	const state = await reviewersGraph.getState(config)
	const assignedAddresses = state.values.humanReviews?.map((r: HumanReview) =>
		r.address.toLowerCase()
	) || []

	if (!assignedAddresses.includes(review.address.toLowerCase())) {
		throw new Error("Forbidden: Address not assigned as Peer Reviewer for this publication.")
	}

	// 3. Resume Graph
	// Command triggers the 'interrupt' in humanReviewsNode to return this payload
	return await reviewersGraph.invoke(
		new Command({
			resume: { review }
		}),
		config
	)
}