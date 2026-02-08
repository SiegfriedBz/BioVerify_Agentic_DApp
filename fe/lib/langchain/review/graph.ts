'server-only'

import { END, MemorySaver, START, StateGraph } from "@langchain/langgraph"
import { InMemoryCache } from "@langchain/langgraph-checkpoint"
import { humanReviewsNode } from "./nodes/1.human-reviews"
import { llmVerdictNode } from "./nodes/2.llm-verdict"
import { seniorReviewNode } from "./nodes/3.senior-review"
import { llmFinalVerdictNode } from "./nodes/4.llm-final-verdict"
import { LlmDecisionSchema, ReviewsStateAnnotation } from "./state"

/**
 * BIOVERIFY AI REVIEWERS GRAPH
 * * This LangGraph orchestrates the autonomous peer-review verification pipeline 
 * for scientific publications. It implements a multi-layered consensus model 
 * combining Human-in-the-Loop (HITL) and AI Forensic Analysis.
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
 * * @outcomes 
 * - PASS: Publisher recovers stake; Honest reviewers rewarded; Dissenters slashed.
 * - FAIL: Publisher slashed (stake to 0); Honest reviewers rewarded; Negligent reviewers slashed.
 * - PULL-PAYMENT: All rewards/stakes are moved to a contract mapping for secure user withdrawal.
 */

const builder = new StateGraph(ReviewsStateAnnotation)

builder
  .addNode("humanReviewsNode", humanReviewsNode)
  .addNode("llmVerdictNode", llmVerdictNode)
  .addNode("seniorReviewNode", seniorReviewNode)
  .addNode("llmFinalVerdictNode", llmFinalVerdictNode)

  .addEdge(START, "humanReviewsNode")
  .addEdge("humanReviewsNode", "llmVerdictNode")

  .addConditionalEdges(
    "llmVerdictNode",
    (state) => (state.llmVerdict.decision === LlmDecisionSchema.enum.escalate ? "seniorReviewNode" : "llmFinalVerdictNode")
  )

  .addEdge("seniorReviewNode", "llmFinalVerdictNode") // Senior flows into Final
  .addEdge("llmFinalVerdictNode", END) // Final flows to END

// MemorySaver provides local persistence for short-lived thread state.
// TODO migrate to a Postgres checkpointer.
const checkpointer = new MemorySaver()

/**
 * Compiled Submission Graph
 * Thread-safe and persistent, allowing for asynchronous "Fire and Forget" 
 * execution via Vercel's waitUntil.
 */
export const reviewersGraph = builder.compile({
  cache: new InMemoryCache(),
  checkpointer,
})
