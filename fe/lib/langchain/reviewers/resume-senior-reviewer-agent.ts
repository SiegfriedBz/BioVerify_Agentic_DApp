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

export const resumeSeniorReviewerAgent = async (params: Params) => {
	const { threadId, network, review, signature } = params

	const config = { configurable: { thread_id: threadId } }

	// 1. EIP-712 CRYPTOGRAPHIC VERIFICATION 
	const isValid = await checkRewiewEip712({ network, threadId, review, signature })

	if (!isValid) throw new Error("Cryptographic verification failed.")

	// 2. SECURE AUTHORIZATION
	const state = await reviewersGraph.getState(config)
	const assignedSeniorReviewerAddress = state.values.seniorReview?.reviewer?.address

	if (assignedSeniorReviewerAddress?.toLowerCase() !== review.address?.toLowerCase()) {
		throw new Error("Unauthorized: This address is not assigned as a Senior Reviewer to this publication.")
	}

	// 3. PUSH review & RESUME GRAPH
	return await reviewersGraph.invoke(
		new Command({
			resume: {
				seniorReview: { reviewer: review }
			}
		}),
		config,
	)
}
