'server-only'

import { HumanMessage, SystemMessage } from "langchain"
import { createChatModel } from "../../utils/create-chat-model"
import { LlmDecisionSchema, LlmVerdictSchema, ReviewsState } from "../state"

/**
 * llmFinalVerdictNode
 * * HUMAN-FINALITY LOGIC:
 * 1. If no escalation: The original AI verdict stands.
 * 2. If escalated: The Senior Reviewer is the "Golden Truth".
 * 3. Role: The LLM synthesizes the Senior Reviewer's decision into the 
 * final state to ensure the on-chain reason is professional and consolidated.
 */
export const llmFinalVerdictNode = async (state: ReviewsState) => {
  const { publicationId, llmVerdict, seniorReview } = state

  // Case 1: No escalation. AI's forensic analysis was clear enough.
  if (llmVerdict.decision !== LlmDecisionSchema.enum.escalate) {
    return { llmVerdict }
  }

  // Case 2: Escalation occurred. We MUST follow the Senior Reviewer.
  // Safety check: ensure the senior reviewer actually provided a verdict.
  if (!seniorReview?.reviewer.verdict) {
    throw new Error("Critical Error: Escalation path reached without a Senior Reviewer verdict.")
  }

  const llm = createChatModel()
  const structuredLlm = llm.withStructuredOutput(LlmVerdictSchema)

  const systemMsg = new SystemMessage(`
    You are the Final Protocol Recorder for BioVerify.
    A dispute occurred regarding Publication ${publicationId}. 
    A Senior Reviewer (Human Authority) has made the final decision.
    
    YOUR MISSION:
    1. Adopt the Senior Reviewer's decision (pass or fail) exactly.
    2. Synthesize a professional, technical "Final Reason" for the blockchain.
    3. Incorporate the Senior Reviewer's reasoning while cleaning up any informal language.
    4. You are NOT allowed to overrule the Senior Reviewer.
  `)

  const humanMsg = new HumanMessage(`
    PROTOCOL DATA:
    - Initial AI Doubt: ${llmVerdict.reason}
    - Senior Reviewer Decision: ${seniorReview.reviewer.verdict.decision}
    - Senior Reviewer Reasoning: ${seniorReview.reviewer.verdict.reason}
    
    Format the final LlmVerdict object. The decision MUST match the Senior Reviewer's decision.
  `)

  const response = await structuredLlm.invoke([systemMsg, humanMsg])

  // FINAL SAFETY CHECK: Ensure the LLM didn't hallucinate an override
  // If the Senior said 'pass', the response MUST be 'pass'.
  const finalizedDecision = {
    decision: seniorReview.reviewer.verdict.decision, // Force human-finality
    reason: response.reason
  }

  return { llmVerdict: finalizedDecision }
}