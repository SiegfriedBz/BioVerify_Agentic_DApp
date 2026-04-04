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
 * COMMAND: slashPublication
 * Marks a publication as fraudulent.
 * Pins the reasoning to IPFS, executes the on-chain slash, and alerts the community.
 */
export async function slashPublicationCommand(params: Params) {
	const {
		network,
		publicationId,
		rootCid,
		reason,
		honestAddresses,
		negligentAddresses,
	} = params

	try {
		// 1. IPFS Evidence
		const verdictCid = await pinText({
			text: reason,
			fileName: `publication-${publicationId}-slash-verdict`,
		})

		// 2. On-Chain Execution
		const contractConfig = BioVerifyContractConfig[network]
		const { publicClient, agentClient } = getViemClient(network)

		const { request } = await publicClient.simulateContract({
			account: agentAccount,
			...contractConfig,
			functionName: "slashPublication",
			args: [
				BigInt(publicationId),
				honestAddresses,
				negligentAddresses,
				verdictCid,
			],
		})

		const hash = await agentClient.writeContract(request)
		console.log(`🚨 [CQRS] Slash Transaction Sent: ${hash}`)

		// 3. Notification
		await notify({ ...params, verdictCid })

		return { success: true, verdictCid, hash }
	} catch (error) {
		console.error(
			`❌ [CQRS] slashPublicationCommand Failed for Pub #${publicationId}:`,
			error,
		)
		throw error
	}
}

// Internal notification logic
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

	const mask = (addr: string) => `\`${addr.slice(0, 6)}...${addr.slice(-4)}\``
	const honestList =
		honestAddresses.length > 0 ? honestAddresses.map(mask).join(", ") : "_None_"
	const negligentList =
		negligentAddresses.length > 0
			? negligentAddresses.map(mask).join(", ")
			: "_None_"

	const message =
		`🚨 *BioVerify Alert: Publication Slashed*\n\n` +
		`*Network:* #${networkMessage(network)}\n` +
		`*Publication:* #${publicationId}\n\n` +
		`⚠️ *Negligent Reviewers (Slashed):*\n${negligentList}\n\n` +
		`🛡️ *Honest Reviewers (Rewarded):*\n${honestList}\n\n` +
		`📝 *Verdict Summary:*\n` +
		`> ${reason.slice(0, 300)}...\n\n` +
		`🔗 [Full Verdict](${PINATA_IPFS_URL}/${verdictCid})\n` +
		`🔗 [Manifest](${PINATA_IPFS_URL}/${rootCid})`

	await sendTelegramNotification(message)
}
