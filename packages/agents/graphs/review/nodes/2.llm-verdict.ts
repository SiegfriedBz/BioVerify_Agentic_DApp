import {
	networkMessage,
	sendTelegramNotification,
} from "@packages/notifications"
import { LlmVerdictSchema } from "@packages/schema"
import { HumanMessage, SystemMessage } from "langchain"
import "server-only"
import { createChatModel } from "../../../model/factory"
import type { ReviewsState } from "../state"

export const llmVerdictNode = async (
	state: ReviewsState,
): Promise<Partial<ReviewsState>> => {
	const { publicationId, humanReviews, network } = state

	const llm = createChatModel()
	const structuredLlm = llm.withStructuredOutput(LlmVerdictSchema)

	const systemMsg = new SystemMessage(`
    You are the Lead Forensic Editor for BioVerify. 
    Analyze the ${humanReviews.length} peer reviews for Publication ${publicationId}.
    
    EVALUATION RULES:
    1. "pass": Strong consensus, no technical red flags.
    2. "fail": Fatal flaws found (e.g., data fraud, plagiarism).
    3. "escalate": Use if there's a split decision (e.g., 1 pass, 1 fail) or if one reviewer mentions a specific fraud risk that others ignored.
    Note: You can NOT leave the decision as "pending".
  `)

	const humanMsg = new HumanMessage(
		`Review Data:\n${humanReviews
			.map(
				(r) =>
					`Reviewer ${r.address}: [${r.verdict?.decision.toUpperCase()}] - ${r.verdict?.reason}`,
			)
			.join("\n")}`,
	)

	const response = await structuredLlm.invoke([systemMsg, humanMsg])

	// Notify the community
	const message =
		`🤖 *BioVerify Alert: AI Analysis Complete*\n\n` +
		`*Network:* #${networkMessage(network)}\n` +
		`*Publication:* #${state.publicationId}\n` +
		`*Phase:* Automated Integrity Check\n\n` +
		`⚖️ *Decision:* \n` +
		`\`${response.decision.toUpperCase()}\`\n\n` +
		`📖 *Reasoning:* \n` +
		`> ${response.reason}\n\n` +
		`🛠️ _Protocol moving to next lifecycle stage..._`

	await sendTelegramNotification(message)

	return { llmVerdict: response }
}
