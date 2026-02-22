'server-only'

import { InterruptKind, LlmDecisionSchema } from "@/app/_schemas/schemas/langchain/review"
import { getThreadId } from "@/app/_utils/get-thread-id"
import { sendTelegramNotification } from "@/app/api/telegram/send-notification"
import { reviewersGraph } from "./graph"

const PINATA_IPFS_URL = process.env.NEXT_PUBLIC_PINATA_IPFS_URL ?? ""

type Params = {
	publicationId: string
	rootCid: string
	reviewers: string[]
	seniorReviewer: string
}

/**
 * Entry point for the Reviewer AI Agent.
 * Initializes state and executes the graph. 
 */
export const startReviewersAgent = async (params: Params) => {
	const { publicationId, rootCid, reviewers, seniorReviewer } = params
	const threadId = getThreadId({ publicationId, rootCid })
	const config = { configurable: { thread_id: threadId } }

	// 1. Check if the graph is already in the database
	const snapshot = await reviewersGraph.getState(config)

	// If 'values' has data, it means the graph already started or is at an interrupt.
	// We exit early to prevent Alchemy from triggering a duplicate workflow.
	if (snapshot.values && Object.keys(snapshot.values).length > 0) {
		console.log(`⚠️ Thread ${threadId} already exists. Skipping.`)
		return { existingState: snapshot.values }
	}

	// 2. Initialize State
	const input = {
		publicationId,
		rootCid,
		humanReviews: reviewers.map(address => ({ address })),
		llmVerdict: { decision: LlmDecisionSchema.enum.pending, reason: "" },
		seniorReview: { address: seniorReviewer }
	}

	// 3. Notify the community
	const mask = (addr: string) => `\`${addr.slice(0, 6)}...${addr.slice(-4)}\``

	const seniorMasked = mask(seniorReviewer)
	const peersMasked = reviewers.map(mask).join(', ')

	const message =
		`🎲 *BioVerify Alert: Review Phase Started*\n\n` +
		`*Publication:* #${publicationId}\n` +
		`*Status:* Reviewers selection finalized via VRF\n\n` +
		`👑 *Senior Reviewer:* \n${seniorMasked}\n\n` +
		`👥 *Peer Reviewers:* \n${peersMasked}\n\n` +
		`📝 *Action Required:* \n` +
		`The assigned experts are now reviewing the manifest for scientific integrity.\n\n` +
		`🔗 [View Research Manifest](${PINATA_IPFS_URL}/${rootCid})\n\n` +
		`🧪 _Awaiting expert verdict..._`

	await sendTelegramNotification(message)

	// 4. Execute Graph
	// The graph will run until it hits the first 'interrupt' (humanReviewsNode)
	const result = await reviewersGraph.invoke(input, config)

	// 5. Handle Interrupts (HITL)
	// We check if the graph returned an interrupt to tell the UI what to display
	if (result && typeof result === "object" && "__interrupt__" in result) {
		const interrupt = Array.isArray(result.__interrupt__) ? result.__interrupt__[0] : result.__interrupt__
		const { kind, llmVerdictReason } = interrupt.value

		if (kind === InterruptKind.REVIEW_PUBLICATION) {
			return { interrupt: { threadId, publicationId, rootCid, reviewersAddresses: reviewers } }
		}

		if (kind === InterruptKind.SENIOR_REVIEW_PUBLICATION) {
			return { interrupt: { threadId, publicationId, rootCid, seniorReviewerAddress: seniorReviewer, llmVerdictReason } }
		}
	}

	return { finalState: result }
}