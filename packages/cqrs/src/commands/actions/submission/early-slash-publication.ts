import { env } from "@packages/env"
import { networkMessage, sendTelegramNotification } from "@packages/notifications"
import { NetworkT } from "@packages/schema"
import { BioVerifyContractConfig } from "@packages/utils"
import { agentAccount, getViemClient, pinText } from "@packages/utils-server"
import 'server-only'

const PINATA_IPFS_URL = env.NEXT_PUBLIC_PINATA_IPFS_URL ?? ""

type Params = {
  network: NetworkT
  publicationId: string
  rootCid: string
  reason: string
}

/**
 * COMMAND: earlySlashPublication
 * Triggered when submission agent detect fraud (Plagiarism).
 * Prevents the publication from moving to the review stage.
 */
export async function earlySlashPublicationCommand(params: Params) {
  const { network, publicationId, rootCid, reason } = params

  try {
    // 1. Evidence Pinning
    const verdictCid = await pinText({
      text: reason,
      fileName: `publication-${publicationId}-early-slash-verdict`
    })

    // 2. On-Chain Execution
    const contractConfig = BioVerifyContractConfig[network]
    const { publicClient, agentClient } = getViemClient(network)

    const { request } = await publicClient.simulateContract({
      account: agentAccount,
      ...contractConfig,
      functionName: 'earlySlashPublication',
      args: [BigInt(publicationId), verdictCid]
    })

    const hash = await agentClient.writeContract(request)
    console.log(`[CQRS] Early Slash Executed: ${hash}`)

    // 3. Notification
    await notify({ ...params, verdictCid })

    return { success: true, verdictCid, hash }

  } catch (error) {
    console.error(`[CQRS] earlySlashPublicationCommand Failed:`, error)
    throw error
  }
}

async function notify(params: Params & { verdictCid: string }) {
  const { network, publicationId, rootCid, reason, verdictCid } = params

  const message =
    `🔨 *BioVerify Alert: Early Protocol Slash*\n\n` +
    `*Network:* #${networkMessage(network)}\n` +
    `*Publication:* #${publicationId}\n` +
    `*Action:* Automatic Agent Intervention\n` +
    `*Reason:* Pre-validation Failure (Fraud/Integrity)\n\n` +
    `📝 *Verdict Summary:*\n` +
    `> ${reason.slice(0, 400)}...\n\n` +
    `🔗 [Evidence](${PINATA_IPFS_URL}/${verdictCid})\n` +
    `🔗 [Manifest](${PINATA_IPFS_URL}/${rootCid})`

  await sendTelegramNotification(message)
}