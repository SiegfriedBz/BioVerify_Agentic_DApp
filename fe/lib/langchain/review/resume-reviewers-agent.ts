'server-only'

import { NetworkT } from "@/app/_schemas/wallet"
import { Command } from "@langchain/langgraph"
import { reviewersGraph } from "./graph"
import { HumanFullReview } from "./state"
import { checkRewiewEip712 } from "./utils/check-review-eip712"

type Params = {
	threadId: string
	network: NetworkT
	review: HumanFullReview["reviewer"]
	signature: `0x${string}` // The hex signature from the wallet
}

export const resumeReviewersAgent = async (params: Params) => {
	const { threadId, network, review, signature } = params

	const config = { configurable: { thread_id: threadId } }

	// 1. EIP-712 CRYPTOGRAPHIC VERIFICATION 
	const isValid = await checkRewiewEip712({ network, threadId, review, signature })

	if (!isValid) throw new Error("Cryptographic verification failed.")

	// 2. SECURE AUTHORIZATION
	const state = await reviewersGraph.getState(config)
	const assignedReviewers = state.values.humanReviews.map((r: HumanFullReview) => r.reviewer.address?.toLowerCase())

	if (!assignedReviewers.includes(review.address?.toLowerCase())) {
		throw new Error("Unauthorized: This address is not assigned to this publication.")
	}

	// 3. PUSH review & RESUME GRAPH
	return await reviewersGraph.invoke(
		new Command({
			resume: {
				humanReviews: [{ reviewer: review }]
			}
		}),
		config,
	)
}