import { END, START, StateGraph } from "@langchain/langgraph"
import "server-only"
import pgCheckpointer from "../../utils/agents-pool"
import { fetchIpfsNode } from "./nodes/1.fetch-ipfs"
import { discoveryNode } from "./nodes/2.discovery"
import { llmNode } from "./nodes/3.llm-verdict"
import { SubmissionStateSchema } from "./state"

/**
 * BIOVERIFY AI SUBMISSION GRAPH
 *
 * This LangGraph orchestrates the autonomous pre-validation of scientific submissions.
 * It serves as a decentralized "Proof of Originality" filter, ensuring that only
 * novel research enters the peer-review staking pool.
 *
 * Pipeline:
 * 1. fetchIpfsNode: IPFS Ingestion. Resolves the multi-layer manifest
 *    (rootCid -> Metadata -> Abstract text).
 * 2. discoveryNode: Forensic Search. Exa AI neural search for prior academic
 *    publications matching the abstract. Returns up to 5 scored sources.
 * 3. llmNode: AI Verdict. LLM-driven plagiarism analysis with structured output.
 *    Produces { decision: "pass" | "fail", reason }.
 *
 * @triggered-by On-chain SubmitPublication event (Alchemy -> CQRS -> Inngest pipeline)
 * @outcomes Post-graph, agent-start.ts branches:
 *   "pass" -> pickReviewersCommand (Chainlink VRF selection)
 *   "fail" -> earlySlashPublicationCommand (immediate publisher slash)
 */

const builder = new StateGraph(SubmissionStateSchema)
	.addNode("fetchIpfsNode", fetchIpfsNode)
	.addNode("discoveryNode", discoveryNode)
	.addNode("llmNode", llmNode)

	.addEdge(START, "fetchIpfsNode")
	.addEdge("fetchIpfsNode", "discoveryNode")
	.addEdge("discoveryNode", "llmNode")
	.addEdge("llmNode", END)

/**
 * Compiled Submission Graph
 * Thread-safe and persistent, allowing for asynchronous "Fire and Forget"
 * execution via Vercel's waitUntil.
 */
export const submissionGraph = builder.compile({
	/** Persistence Layer: Connects to Neon/Postgres */
	checkpointer: pgCheckpointer,
})
