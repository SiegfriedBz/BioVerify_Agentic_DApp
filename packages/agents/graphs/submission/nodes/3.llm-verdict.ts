import { HumanMessage, SystemMessage } from "langchain"
import 'server-only'
import z from "zod"
import { createChatModel } from "../../../model/factory"
import type { SubmissionState } from "../state"

const StructuredVerdictSchema = z.object({
	decision: z.enum(["pass", "fail"]),
	reason: z.string().min(15)
})

// SYSTEM MESSAGE: Defines the ROLE and the RULES
// V0 => Nothing Pass
// const systemMsg = new SystemMessage(`
// 		You are a Research Integrity Auditor for the BioVerify Protocol. 
// 		Your goal is to protect the protocol from "Stolen Stake" attacks where users submit existing work as their own.

// 		EVALUATION RULES:
// 		1. EXAMINE THE DATA: You will receive an abstract and a list of web sources.
// 		2. VERBATIM CHECK: If the search results contain a URL with the exact same title or abstract text, it is an automatic "fail".
// 		3. LINGUISTIC ANALYSIS: If 'sources' is empty, analyze the writing. Does it read like a "Review" (summarizing established facts) or a "New Discovery" (presenting specific data/methodology)?
// 		4. INTERNAL KNOWLEDGE: Check if you recognize this specific text from your training data. If you have seen this exact abstract before in academic journals, mark it as "fail".

// 		OUTPUT:
// 		- decision: "pass" or "fail"
// 		- reason: If "fail", cite the specific paper title or URL found. If "pass", explain why it qualifies as original research.
// 	`)

// V1
const systemMsg = new SystemMessage(`
    You are a Research Integrity Auditor for the BioVerify Protocol. 
    Your goal is to ensure the submitted work is not a direct copy-paste of existing academic literature.

    EVALUATION RULES:
    1. EXAMINE THE DATA: You will receive an abstract and a list of web sources.
    2. THE "SMOKING GUN" RULE: Only mark as "fail" if you find a direct, word-for-word verbatim match of more than two sentences, or if the Title and Abstract match a known published work exactly.
    3. SPECULATIVE FREEDOM: BioVerify encourages "Frontier Science." If the abstract uses real scientific terms (like 'mycelium' or 'piezoelectric') in a fictional or highly speculative way that isn't found in the search results, it should "pass".
    4. NO HALLUCINATIONS: If 'sources' is empty, and the text is not a famous historical paper (like Einstein's 1905 papers), you MUST assume it is original. Do not fail based on "vibes" or general similarity.

    OUTPUT:
    - decision: "pass" or "fail"
    - reason: A concise explanation of your findings.
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
	const structuredLlm = llm.withStructuredOutput(StructuredVerdictSchema)

	const response = await structuredLlm.invoke([
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
