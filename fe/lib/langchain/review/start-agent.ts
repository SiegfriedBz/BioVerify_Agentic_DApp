'server-only'

import { NetworkT } from "@/app/_schemas/wallet"
import { settleReviewFail, settleReviewPass } from "@/lib/protocol/review/actions"
import { getThreadId } from "@/lib/utils/get-thread-id"
import { reviewersGraph } from "./graph"
import { InterruptKind, LlmDecisionSchema, ReviewsState } from "./state"

type Params = {
	network: NetworkT
	publicationId: string
	rootCid: string
	reviewers: string[]
	seniorReviewer: string // The high-reputation "Reviewer"
	minValidReviewsCount: number
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
		seniorReviewer,
		minValidReviewsCount
	} = params

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

	// 1. Start Graph Execution
	const result = await reviewersGraph.invoke(input, config)

	// 2. Handle HITL responses
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

	// 3. Handle the Verdict
	const finalVerdict = result.llmVerdict

	if (finalVerdict.decision === LlmDecisionSchema.enum.pass || finalVerdict.decision === LlmDecisionSchema.enum.fail) {

		// Combine all human participants (Initial Reviewers + Senior if was involved)
		const allParticipants = [...result.humanReviews]
		if (result.seniorReview?.reviewer?.verdict) {
			allParticipants.push(result.seniorReview)
		}

		// Filter into Honest vs Negligent based on the Final Decision
		const addresses = allParticipants.reduce((acc, curr) => {
			const reviewerAddress = curr.reviewer.address
			const isHonest = curr.reviewer.verdict?.decision === finalVerdict.decision

			if (isHonest) {
				acc.honest.push(reviewerAddress)
			} else {
				acc.negligent.push(reviewerAddress)
			}

			return acc
		}, { honest: [] as string[], negligent: [] as string[] })

		const settleParams = {
			network,
			publicationId,
			rootCid,
			reason: finalVerdict.reason,
			honestAddresses: addresses.honest,
			negligentAddresses: addresses.negligent,
		}

		if (finalVerdict.decision === LlmDecisionSchema.enum.pass) {
			await settleReviewPass(settleParams)
		} else {
			await settleReviewFail(settleParams)
		}
	}

	// 4. Return state
	return {
		finalState: result,
	}
}
