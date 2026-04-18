import { env } from "@packages/env"
import {
	networkMessage,
	sendTelegramNotification,
} from "@packages/notifications"
import type { NetworkT } from "@packages/schema"
import { BioVerifyContractConfig } from "@packages/utils"
import { agentAccount, getViemClient } from "@packages/utils-server"
import "server-only"

const PINATA_IPFS_URL = env.NEXT_PUBLIC_PINATA_IPFS_URL ?? ""

type Params = {
	network: NetworkT
	publicationId: string
	rootCid: string
}

/**
 * COMMAND: pickReviewersCommand
 * Executed after a publication passes AI Pre-Validation.
 * Triggers the on-chain Chainlink VRF request to assign peer reviewers.
 */
export async function pickReviewersCommand(params: Params) {
	const { network, publicationId } = params

	try {
		console.log(`[CQRS] Initiating VRF for Publication #${publicationId}`)

		const contractConfig = BioVerifyContractConfig[network]
		const { publicClient, agentClient } = getViemClient(network)

		// 1. On-Chain Execution
		const { request } = await publicClient.simulateContract({
			account: agentAccount,
			...contractConfig,
			functionName: "pickReviewers",
			args: [BigInt(publicationId)],
		})

		const hash = await agentClient.writeContract(request)

		// 2. Notification
		await notify(params)

		return { success: true, hash }
	} catch (error) {
		console.error(
			`[CQRS] pickReviewersCommand Failed for #${publicationId}:`,
			error,
		)
		throw error
	}
}

async function notify(params: Params) {
	const { network, publicationId, rootCid } = params

	const message =
		`🎲 *BioVerify Alert: Review Phase Started*\n\n` +
		`*Network:* #${networkMessage(network)}\n` +
		`*Publication:* #${publicationId}\n` +
		`*Phase:* AI Validation Passed ✅\n\n` +
		`*Status:* Requesting random reviewers via Chainlink VRF...\n\n` +
		`🔗 [View Research Manifest](${PINATA_IPFS_URL}/${rootCid})\n\n` +
		`⛓️ _Waiting for cryptographically secure randomness..._`

	await sendTelegramNotification(message)
}
