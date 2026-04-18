import {
	publishPublicationCommand,
	slashPublicationCommand,
} from "@packages/cqrs"
import { HumanDecisionSchema } from "@packages/schema"
import "server-only"
import type { ReviewsState } from "../state"

/**
 * Settlement Node:
 * This is the final functional step in the graph.
 * It executes the on-chain transaction based on the AI/Human consensus.
 */
export const settlementNode = async (state: ReviewsState) => {
	const { decision, reason } = state.llmVerdict
	const { publicationId, rootCid } = state

	// 1. Compute which addresses to reward/slash
	const { honest, negligent } = filterHonestsAndNegligents(state)

	const settleParams = {
		network: state.network,
		publicationId,
		rootCid,
		reason,
		honestAddresses: honest,
		negligentAddresses: negligent,
	}

	// 2. Execute On-Chain Transaction
	if (decision === HumanDecisionSchema.enum.pass) {
		await publishPublicationCommand(settleParams)
	} else if (decision === HumanDecisionSchema.enum.fail) {
		await slashPublicationCommand(settleParams)
	}

	// We return an empty object because the state is already finalized;
	// this node is for side-effects (blockchain interaction).
	return {}
}

/**
 * @notice Partitions assigned reviewers into honest and negligent sets for on-chain settlement.
 * @dev Evaluates peer reviewer verdicts against the protocol's final consensus to determine slashing or rewards.
 * The Senior Reviewer is deliberately classified as honest to ensure liquidity release and standby fee distribution.
 */
const filterHonestsAndNegligents = (state: ReviewsState) => {
	const finalDecision = state.llmVerdict.decision
	const honest: string[] = []
	const negligent: string[] = []

	const peerReviewers = [...state.humanReviews]

	peerReviewers.forEach((participant) => {
		if (!participant.verdict?.decision) {
			return
		}

		// Evaluate peer reviewer verdicts against the protocol's final consensus
		if (participant.verdict.decision === finalDecision) {
			honest.push(participant.address)
		} else {
			negligent.push(participant.address)
		}
	})

	// Unconditionally append the Senior Reviewer to the honest array.
	// By protocol design, if escalated, the Senior's verdict dictates the final consensus.
	// If unescalated (peer consensus reached), this ensures their locked stake is safely released and their standby fee is distributed.
	honest.push(state.seniorReview.address)

	return { honest, negligent }
}
