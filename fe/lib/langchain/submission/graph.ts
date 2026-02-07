'server-only'

import { END, MemorySaver, START, StateGraph } from "@langchain/langgraph"
import { InMemoryCache } from "@langchain/langgraph-checkpoint"
import { fetchIpfsNode } from "./nodes/1.fetch-ipfs"
import { tavilyNode } from "./nodes/2.tavily"
import { llmNode } from "./nodes/3.llm-verdict"
import { SubmissionStateSchema } from "./state"

/**
 * BIOVERIFY AI SUBMISSION GRAPH
 * * This LangGraph orchestrates the autonomous pre-validation of scientific submissions.
 * It serves as a decentralized "Proof of Originality" filter, ensuring that only
 * novel research enters the peer-review staking pool.
 * * Pipeline:
 * 1. IPFS Ingestion: Resolution of the multi-layer manifest (Metadata -> Abstract).
 * 2. Forensic Search: Multi-source web crawling via Tavily to detect existing literature.
 * 3. AI Verdict: LLM-driven plagiarism analysis and "Slashing" decision logic.
 * * @triggered-by Alchemy Webhooks (On-Chain BioVerify_SubmittedPublication event)
 * @outcomes "pass" (proceed to VRF selection) | "fail" (immediate protocol slash)
 */

const builder = new StateGraph(SubmissionStateSchema)

  // Define Graph Nodes
  // Cache Policy is set to effectively permanent (within session) to prevent 
  // redundant LLM/Search costs during retry logic or state recovery.
  .addNode("fetchIpfsNode", fetchIpfsNode, {
    cachePolicy: { ttl: 10_000_000_000 },
  })
  .addNode("tavilyNode", tavilyNode, {
    cachePolicy: { ttl: 10_000_000_000 },
  })
  .addNode("llmNode", llmNode, {
    cachePolicy: { ttl: 10_000_000_000 },
  })

  // Define Execution Flow (Linear Pipeline)
  // We start by hydrating the state from IPFS before performing external lookups.
  .addEdge(START, "fetchIpfsNode")
  .addEdge("fetchIpfsNode", "tavilyNode")
  .addEdge("tavilyNode", "llmNode")
  .addEdge("llmNode", END)

// MemorySaver provides local persistence for short-lived thread state.
// TODO migrate to a Postgres checkpointer.
const checkpointer = new MemorySaver()

/**
 * Compiled Submission Graph
 * Thread-safe and persistent, allowing for asynchronous "Fire and Forget" 
 * execution via Vercel's waitUntil.
 */
export const submissionGraph = builder.compile({
  cache: new InMemoryCache(),
  checkpointer,
})