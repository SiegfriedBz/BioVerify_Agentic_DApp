'server-only'

import { NetworkT } from "@/app/_schemas/wallet"
import { getThreadId } from "@/lib/utils/get-thread-id"
import { reviewersGraph } from "./graph"
import { InterruptKind, LlmDecisionSchema, ReviewsState } from "./state"

type Params = {
	network: NetworkT
	publicationId: string
	rootCid: string
	reviewers: string[]
	seniorReviewer: string // The high-reputation "Reviewer"
}

type Return =
	| {
		interrupt: {
			threadId: string
			publicationId: string
			rootCid: string
			reviewersAddresses: string[]
		} | {
			threadId: string
			publicationId: string
			rootCid: string
			seniorReviewerAddress: string
			llmVerdictReason: string
		}
	}
	| { finalState: ReviewsState }

export const startReviewersAgent = async (params: Params): Promise<Return> => {
	const {
		network,
		publicationId,
		rootCid,
		reviewers,
		seniorReviewer
	} = params

	// TODO fetch from contract
	const minValidReviewsCount = 2

	const threadId = getThreadId({ publicationId, rootCid })

	const config = { configurable: { thread_id: threadId } }

	const input = {
		publicationId,
		rootCid,
		minValidReviewsCount,
		humanReviews: reviewers.map(address => {
			return { reviewer: { address } }
		}),
		llmVerdict: { decision: LlmDecisionSchema.enum.pending, reason: "" },
		seniorReview: { reviewer: { address: seniorReviewer } }
	}

	const result = await reviewersGraph.invoke(input, config)

	// 1. Handle HITL responses
	if (result && typeof result === "object" && "__interrupt__" in result) {
		const stops = Array.isArray(result.__interrupt__)
			? result.__interrupt__
			: [result.__interrupt__]

		for (const stop of stops) {
			// HITL - human review needed
			if (stop?.value?.kind === InterruptKind.REVIEW_PUBLICATION) {

				return {
					interrupt: {
						threadId,
						publicationId,
						rootCid,
						reviewersAddresses: reviewers
					},
				}
			}

			// HITL - human senior review needed
			if (stop?.value?.kind === InterruptKind.SENIOR_REVIEW_PUBLICATION) {
				const llmVerdictReason = stop?.value?.llmVerdictReason

				return {
					interrupt: {
						threadId,
						publicationId,
						rootCid,
						seniorReviewerAddress: seniorReviewer,
						llmVerdictReason
					},
				}
			}
		}
	}

	// 2. Handle the Verdict
	if (result.llmVerdict.decision === "fail") {
		// Call Smart Contract to slash publisher /unfair reviewers + pay fair reviewers
		// await slashPublisher({ network, publicationId, reason: result.llmVerdict.reason ?? "", rootCid })

	} else if (result.llmVerdict.decision === "pass") {
		// Call Smart Contract's to pay publisher + fair reviewers
	}

	// handle case where result.llmVerdict.decision === "pending" ?

	// 3. Return state
	return {
		finalState: result,
	}
}
