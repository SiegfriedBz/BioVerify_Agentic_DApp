'server-only'

import { HumanMessage, SystemMessage } from "langchain"
import { createChatModel } from "../../utils/create-chat-model"
import { LlmVerdictSchema, ReviewsState } from "../state"

export const llmVerdictNode = async (
  state: ReviewsState,
): Promise<Partial<ReviewsState>> => {
  const { publicationId, humanReviews, minValidReviewsCount } = state

  const llm = createChatModel()
  const structuredLlm = llm.withStructuredOutput(LlmVerdictSchema)

  const systemMsg = new SystemMessage(`
    You are the Lead Forensic Editor for BioVerify. 
    Analyze the ${minValidReviewsCount} peer reviews for Publication ${publicationId}.
    
    EVALUATION RULES:
    1. "pass": Strong consensus, no technical red flags.
    2. "fail": Fatal flaws found (e.g., data fraud, plagiarism).
    3. "escalate": Use if there's a split decision (e.g., 1 pass, 1 fail) or if one reviewer mentions a specific fraud risk that others ignored.
    Note: You can NOT leave the decision as "pending".
  `)

  const humanMsg = new HumanMessage(
    `Review Data:\n${humanReviews.map(r =>
      `Reviewer ${r.reviewer.address}: [${r.reviewer.verdict?.decision.toUpperCase()}] - ${r.reviewer.verdict?.reason}`
    ).join("\n")}`
  )

  const response = await structuredLlm.invoke([systemMsg, humanMsg])

  return { llmVerdict: response }
}


