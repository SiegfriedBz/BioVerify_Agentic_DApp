import type { NetworkT } from "@packages/schema"
import { BioVerifyContractConfig } from "@packages/utils"
import { agentAccount, getViemClient } from "@packages/utils-server"
import "server-only"

type Params = {
	network: NetworkT
	publicationId: string
	reviewerAddress: string
}

/**
 * COMMAND: recordReview
 */
export async function recordReviewCommand(params: Params) {
	const { network, publicationId, reviewerAddress } = params

	try {
		console.log(
			`[CQRS] Executing recordReview | Pub: #${publicationId} | Reviewer: ${reviewerAddress}`,
		)

		// On-Chain Execution
		const contractConfig = BioVerifyContractConfig[network]
		const { publicClient, agentClient } = getViemClient(network)

		const { request } = await publicClient.simulateContract({
			account: agentAccount,
			...contractConfig,
			functionName: "recordReview",
			args: [BigInt(publicationId), reviewerAddress],
		})

		const hash = await agentClient.writeContract(request)

		console.log(`[CQRS] recordReview Transaction Sent: ${hash}`)

		return { success: true, hash }
	} catch (error) {
		console.error(
			`[CQRS] recordReviewCommand Failed for Pub #${publicationId}:`,
			error,
		)
		throw error
	}
}
