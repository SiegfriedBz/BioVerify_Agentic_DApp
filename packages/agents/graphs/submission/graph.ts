import { END, START, StateGraph } from "@langchain/langgraph"
import 'server-only'
import pgCheckpointer from "../../utils/agents-pool"
import { fetchIpfsNode } from "./nodes/1.fetch-ipfs"
import { discoveryNode } from "./nodes/2.discovery"
import { llmNode } from "./nodes/3.llm-verdict"
import { SubmissionStateSchema } from "./state"

/**
 * BIOVERIFY AI SUBMISSION GRAPH
 * * This LangGraph orchestrates the autonomous pre-validation of scientific submissions.
 * It serves as a decentralized "Proof of Originality" filter, ensuring that only
 * novel research enters the peer-review staking pool.
 * * Pipeline:
 * 1. IPFS Ingestion: Resolution of the multi-layer manifest (Metadata -> Abstract).
 * 2. Forensic Search: Multi-source web crawling to detect existing literature.
 * 3. AI Verdict: LLM-driven plagiarism analysis and "Slashing" decision logic.
 * * @triggered-by Alchemy Webhooks (On-Chain BioVerify_SubmitPublication event)
 * @outcomes "pass" (proceed to VRF selection) | "fail" (immediate protocol slash)
 */

const builder = new StateGraph(SubmissionStateSchema)
  .addNode("fetchIpfsNode", fetchIpfsNode)
  .addNode("discoveryNode", discoveryNode)
  .addNode("llmNode", llmNode,)

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