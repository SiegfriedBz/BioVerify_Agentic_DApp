import { END, START, StateGraph } from "@langchain/langgraph"
import { LlmDecisionSchema } from "@packages/schema"
import pgCheckpointer from "packages/agents/utils/agents-pool"
import 'server-only'
import { humanReviewsNode } from "./nodes/1.human-reviews"
import { llmVerdictNode } from "./nodes/2.llm-verdict"
import { seniorReviewNode } from "./nodes/3.senior-review"
import { llmFinalVerdictNode } from "./nodes/4.llm-final-verdict"
import { settlementNode } from "./nodes/5.settement-node"
import { ReviewsState, ReviewsStateAnnotation } from "./state"

/**
 * =====================================================================
 * BIOVERIFY AI REVIEWERS GRAPH (v2.1 - Human-Finality Integrated)
 * =====================================================================
 * This LangGraph orchestrates the autonomous peer-review verification pipeline 
 * for scientific publications, combining AI forensics with human authority.
 * * FLOW LOGIC:
 * 1. humanReviewsNode: Gatekeeper. Waits for the required quorum of 
 * cryptographically verified human reviews (EIP-712).
 * 2. llmVerdictNode: Forensic Auditor. Analyzes human consensus and technical 
 * integrity. Can result in 'pass', 'fail', or 'escalate'.
 * 3. seniorReviewNode: Escalation Path. If the AI detects ambiguity or high-stakes 
 * fraud risks, it pauses for a "Senior Editor" (Reputation-weighted human).
 * 4. llmFinalVerdictNode: Forensic Secretary. Implements "Human-Finality". It 
 * synthesizes the final verdict, ensuring the Senior Reviewer's decision 
 * is enforced while cleaning up reasoning for on-chain storage.
 * 5. settlementNode: Execution Layer. Triggers the blockchain settlement 
 * (publish/slash) based on the finalized consensus.
 * * @outcomes 
 * - PASS: Publisher recovers stake; Honest reviewers rewarded; Dissenters slashed.
 * - FAIL: Publisher slashed; Honest reviewers rewarded; Negligent reviewers slashed.
 */

const builder = new StateGraph(ReviewsStateAnnotation)

// --- Node Configuration ---
builder
  .addNode("humanReviewsNode", humanReviewsNode)
  .addNode("llmVerdictNode", llmVerdictNode)
  .addNode("seniorReviewNode", seniorReviewNode)
  .addNode("llmFinalVerdictNode", llmFinalVerdictNode)
  .addNode("settlementNode", settlementNode)

  // --- Edge & Conditional Logic ---
  .addEdge(START, "humanReviewsNode")

  // Wait for EVERYONE: Loop until the number of verdicts matches the number of assigned reviewers
  .addConditionalEdges("humanReviewsNode", (state: ReviewsState) => {
    const validCount = state.humanReviews.filter(r => r?.verdict).length
    const totalRequired = state.humanReviews.length

    return validCount < totalRequired ? "humanReviewsNode" : "llmVerdictNode"
  })

  // Escalation Logic: AI decides to resolve directly or escalate to a Senior Reviewer
  .addConditionalEdges(
    "llmVerdictNode",
    (state: ReviewsState) =>
      state.llmVerdict.decision === LlmDecisionSchema.enum.escalate
        ? "seniorReviewNode"
        : "llmFinalVerdictNode"
  )

  // Finalization: Senior input flows into the Final Verdict to be synthesized
  .addEdge("seniorReviewNode", "llmFinalVerdictNode")

  // Execution: Move from synthesized verdict to on-chain settlement
  .addEdge("llmFinalVerdictNode", "settlementNode")
  .addEdge("settlementNode", END)


/**
 * Compiled Submission Graph
 * Thread-safe and persistent, allowing for asynchronous "Fire and Forget" 
 * execution via Vercel's waitUntil or background webhooks.
 */
export const reviewersGraph = builder.compile({
  /** Persistence Layer: Connects to Neon/Postgres to enable long-term HITL pauses */
  checkpointer: pgCheckpointer,
})