'server-only'

import { HumanDecisionSchema } from "@/app/_schemas/schemas/langchain/review"
import { publishPublication } from "@/app/api/contract/review/publish-publication"
import { slashPublication } from "@/app/api/contract/review/slash-publication"
import { ReviewsState } from "../state"

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
    publicationId,
    rootCid,
    reason,
    honestAddresses: honest,
    negligentAddresses: negligent,
  }

  // 2. Execute On-Chain Transaction
  if (decision === HumanDecisionSchema.enum.pass) {
    await publishPublication(settleParams)
  } else if (decision === HumanDecisionSchema.enum.fail) {
    await slashPublication(settleParams)
  }

  // We return an empty object because the state is already finalized; 
  // this node is for side-effects (blockchain interaction).
  return {}
}

/**
 * Helper to identify Honest vs Negligent.
 */
const filterHonestsAndNegligents = (state: ReviewsState) => {
  const finalDecision = state.llmVerdict.decision
  const honest: string[] = []
  const negligent: string[] = []

  // Combine peer reviewers and senior reviewer into one list to check
  const allParticipants = [...state.humanReviews]
  if (state.seniorReview?.verdict) allParticipants.push(state.seniorReview)

  allParticipants.forEach((participant) => {
    if (!participant.verdict || !participant.verdict.decision) {
      return
    }

    // check if they match the final protocol truth
    if (participant.verdict.decision === finalDecision) {
      honest.push(participant.address)
    } else {
      negligent.push(participant.address)
    }
  })

  return { honest, negligent }
}