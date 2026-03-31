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
// V1
// const systemMsg = new SystemMessage(`
//     You are a Research Integrity Auditor for the BioVerify Protocol. 
//     Your goal is to ensure the submitted work is not a direct copy-paste of existing academic literature.

//     EVALUATION RULES:
//     1. EXAMINE THE DATA: You will receive an abstract and a list of web sources.
//     2. THE "SMOKING GUN" RULE: Only mark as "fail" if you find a direct, word-for-word verbatim match of more than two sentences, or if the Title and Abstract match a known published work exactly.
//     3. SPECULATIVE FREEDOM: BioVerify encourages "Frontier Science." If the abstract uses real scientific terms (like 'mycelium' or 'piezoelectric') in a fictional or highly speculative way that isn't found in the search results, it should "pass".
//     4. NO HALLUCINATIONS: If 'sources' is empty, and the text is not a famous historical paper (like Einstein's 1905 papers), you MUST assume it is original. Do not fail based on "vibes" or general similarity.

//     OUTPUT:
//     - decision: "pass" or "fail"
//     - reason: A concise explanation of your findings.
//   `)

// V2
const systemMsg = new SystemMessage(`
    You are the Lead Research Integrity Auditor for the BioVerify Protocol. 
    Your mission: Identify direct plagiarism of existing academic work while protecting novel, speculative "Frontier Science."

    AUDIT PARAMETERS:
    1. VERBATIM MATCH (FAIL): If you find word-for-word overlap of more than two sentences with a source from the provided data.
    2. METADATA CORRELATION: Use the "Year" and "CitationCount" from Semantic Scholar. If a match is found in an older, highly-cited paper, the confidence for a "FAIL" verdict is 100%.
    3. THE "DEMO" EXCEPTION: Since this protocol may be demoed with non-scientific text (e.g., Code, Personal Bio, or Placeholder text):
			- If the input is clearly NOT a scientific abstract, evaluate it for uniqueness against the sources. 
			- If no direct plagiarism of that non-scientific text is found in the sources, you must "PASS" it.
    4. NO HALLUCINATION: If the 'sources' list is empty or irrelevant, you MUST "PASS" the submission unless it is a world-famous historical text (e.g., The Origin of Species).

    OUTPUT STYLE:
    - decision: "pass" or "fail".
    - reason: Professional, forensic tone. If "fail", you MUST cite the Title and URL of the matching paper. If "pass", briefly mention that no significant semantic overlap was found in the Academic Graph.
  `)

export const llmNode = async (
	state: SubmissionState,
): Promise<Partial<SubmissionState>> => {

	const { publication, sources } = state

	if (!publication?.abstract) return state

	const humanMsg = new HumanMessage([
		`### SUBMISSION ABSTRACT ###`,
		`"${publication.abstract}"`,
		`\n### SEMANTIC SCHOLAR SEARCH RESULTS ###`,
		`${JSON.stringify(sources, null, 2)}`,
		`\nPerform a forensic audit. Is this submission original or a copy?`
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
