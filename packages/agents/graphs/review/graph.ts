import { END, START, StateGraph } from "@langchain/langgraph"
import { LlmDecisionSchema } from "@packages/schema"
import "server-only"
import pgCheckpointer from "../../utils/agents-pool"
import { humanReviewsNode } from "./nodes/1.human-reviews"
import { llmVerdictNode } from "./nodes/2.llm-verdict"
import { seniorReviewNode } from "./nodes/3.senior-review"
import { llmFinalVerdictNode } from "./nodes/4.llm-final-verdict"
import { settlementNode } from "./nodes/5.settement-node"
import { type ReviewsState, ReviewsStateAnnotation } from "./state"

/**
 * =====================================================================
 * BIOVERIFY AI REVIEWERS GRAPH (v2.1 - Human-Finality Integrated)
 * =====================================================================
 * This LangGraph orchestrates the autonomous peer-review verification pipeline
 * for scientific publications, combining AI forensics with human authority.
 *
 * FLOW LOGIC:
 * 1. humanReviewsNode: Gatekeeper. HITL interrupt that self-loops until ALL
 *    assigned peer reviewers have submitted EIP-712-signed reviews.
 * 2. llmVerdictNode: Forensic Auditor. Analyzes collected human reviews for
 *    consensus and red flags. Produces 'pass', 'fail', or 'escalate'.
 * 3. seniorReviewNode: Escalation Path (conditional — only on 'escalate',
 *    i.e. conflicting peer verdicts). HITL interrupt that waits for the
 *    Senior Reviewer's (reputation-weighted human) EIP-712-signed decision.
 * 4. llmFinalVerdictNode: Forensic Secretary. Implements "Human-Finality".
 *    - If not escalated: passes through the existing AI verdict unchanged.
 *    - If escalated: enforces the Senior Reviewer's decision while polishing
 *      the reasoning for on-chain storage.
 * 5. settlementNode: Execution Layer. Partitions reviewers into honest
 *    (aligned with final decision) and negligent (opposed). The Senior
 *    Reviewer is unconditionally classified as honest. Triggers on-chain
 *    settlement: publishPublication (pass) or slashPublication (fail).
 *
 * @outcomes
 * - PASS: Publisher recovers stake; Honest reviewers rewarded; Negligent reviewers slashed.
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
		const validCount = state.humanReviews.filter((r) => r?.verdict).length
		const totalRequired = state.humanReviews.length

		return validCount < totalRequired ? "humanReviewsNode" : "llmVerdictNode"
	})

	// Escalation Logic: AI decides to resolve directly or escalate to a Senior Reviewer
	.addConditionalEdges("llmVerdictNode", (state: ReviewsState) =>
		state.llmVerdict.decision === LlmDecisionSchema.enum.escalate
			? "seniorReviewNode"
			: "llmFinalVerdictNode",
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
