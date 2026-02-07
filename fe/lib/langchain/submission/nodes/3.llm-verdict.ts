'server-only'

import { HumanMessage, SystemMessage } from "langchain"
import z from "zod"
import { createChatModel } from "../../utils/create-chat-model"
import type { SubmissionState } from "../state"

const StructuredVerdictSchema = z.object({
	decision: z.enum(["pass", "fail"]),
	reason: z.string().min(15)
})

// SYSTEM MESSAGE: Defines the ROLE and the RULES
const systemMsg = new SystemMessage(`
		You are a Research Integrity Auditor for the BioVerify Protocol. 
		Your goal is to protect the protocol from "Stolen Stake" attacks where users submit existing work as their own.

		EVALUATION RULES:
		1. EXAMINE THE DATA: You will receive an abstract and a list of web sources.
		2. VERBATIM CHECK: If the search results contain a URL with the exact same title or abstract text, it is an automatic "fail".
		3. LINGUISTIC ANALYSIS: If 'sources' is empty, analyze the writing. Does it read like a "Review" (summarizing established facts) or a "New Discovery" (presenting specific data/methodology)?
		4. INTERNAL KNOWLEDGE: Check if you recognize this specific text from your training data. If you have seen this exact abstract before in academic journals, mark it as "fail".

		OUTPUT:
		- decision: "pass" or "fail"
		- reason: If "fail", cite the specific paper title or URL found. If "pass", explain why it qualifies as original research.
	`)

export const llmNode = async (
	state: SubmissionState,
): Promise<Partial<SubmissionState>> => {

	const { publication, sources } = state

	if (!publication?.abstract) return state

	// HUMAN MESSAGE: Provides the DATA to process
	const humanMsg = new HumanMessage([
		`Abstract to analyze: "${publication.abstract}"`,
		`Search results found: ${JSON.stringify(sources)}`,
		"Please analyze the abstract against the search results and provide your verdict."
	].join("\n"))

	const llm = createChatModel()
	const structuredLllm = llm.withStructuredOutput(StructuredVerdictSchema)

	const response = await structuredLllm.invoke([
		systemMsg,
		humanMsg
	])

	return {
		verdict: {
			decision: response.decision,
			reason: response.reason
		}
	}
}
