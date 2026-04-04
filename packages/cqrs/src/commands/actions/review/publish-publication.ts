import { env } from "@packages/env"
import {
	networkMessage,
	sendTelegramNotification,
} from "@packages/notifications"
import type { NetworkT } from "@packages/schema"
import { BioVerifyContractConfig } from "@packages/utils"
import { agentAccount, getViemClient, pinText } from "@packages/utils-server"
import "server-only"

const PINATA_IPFS_URL = env.NEXT_PUBLIC_PINATA_IPFS_URL ?? ""

type Params = {
	network: NetworkT
	publicationId: string
	rootCid: string
	reason: string
	honestAddresses: string[]
	negligentAddresses: string[]
}

/**
 * COMMAND: publishPublication
 * Orchestrates IPFS pinning, On-chain settlement, and Notifications.
 */
export async function publishPublicationCommand(params: Params) {
	const {
		network,
		publicationId,
		rootCid,
		reason,
		honestAddresses,
		negligentAddresses,
	} = params

	try {
		console.log(`[CQRS] Executing publishPublication | Pub: #${publicationId}`)

		// 1. IPFS Logic (Metadata)
		const verdictCid = await pinText({
			text: reason,
			fileName: `publication-${publicationId}-review-verdict`,
		})

		// 2. On-Chain Execution
		const contractConfig = BioVerifyContractConfig[network]
		const { publicClient, agentClient } = getViemClient(network)

		const { request } = await publicClient.simulateContract({
			account: agentAccount,
			...contractConfig,
			functionName: "publishPublication",
			args: [
				BigInt(publicationId),
				honestAddresses,
				negligentAddresses,
				verdictCid,
			],
		})

		const hash = await agentClient.writeContract(request)
		console.log(`[CQRS] publishPublication Transaction Sent: ${hash}`)

		// 3. Notification
		await notify({
			...params,
			verdictCid,
		})

		return { success: true, verdictCid, hash }
	} catch (error) {
		console.error(`[CQRS] publishPublicationCommand Failed:`, error)
		throw error // Re-throw so the UI or Agent can handle the error state
	}
}

// Helper
async function notify(params: Params & { verdictCid: string }) {
	const {
		network,
		publicationId,
		rootCid,
		reason,
		honestAddresses,
		negligentAddresses,
		verdictCid,
	} = params

	const isPerfect = negligentAddresses.length === 0
	const honestList = honestAddresses
		.map((addr) => `\`${addr.slice(0, 6)}...${addr.slice(-4)}\``)
		.join(", ")

	const message =
		`✅ *BioVerify Alert: Publication Passed Review*\n\n` +
		`*Network:* #${networkMessage(network)}\n` +
		`*Publication:* #${publicationId}\n\n` +
		`🌟 *Honest (Rewarded):*\n${honestList}\n\n` +
		(isPerfect
			? `✨ *Perfect Review*`
			: `⚠️ *Negligent:* ${negligentAddresses.join(", ")}`) +
		`\n\n📝 *Verdict:*\n> ${reason.slice(0, 300)}...\n\n` +
		`🔗 [Verdict](${PINATA_IPFS_URL}/${verdictCid})`

	await sendTelegramNotification(message)
}
