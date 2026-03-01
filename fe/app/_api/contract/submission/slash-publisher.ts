'server-only'

import { agentAccount } from "@/app/_config/viem/viem-config"
import { getContractConfig } from "@/app/_utils/get-contract-config"
import { getClient } from "@/app/_utils/viem/get-client"
import { getNetworkFromCookies } from "@/app/_utils/wagmi/get-network-from-cookies"
import { pinText } from "@/app/api/pinata/pin-text"
import { sendTelegramNotification } from "@/app/api/telegram/send-notification"

const PINATA_IPFS_URL = process.env.NEXT_PUBLIC_PINATA_IPFS_URL ?? ""

type Params = {
  publicationId: string
  rootCid: string
  reason: string
}

export const slashPublisher = async (params: Params) => {
  const { publicationId, reason, rootCid } = params

  // 1. Store verdict on IPFS
  const verdictCid = await pinText({
    text: reason,
    fileName: `publication-${publicationId}-review-verdict`
  })

  // 2. Call BioVerify.slashPublisher
  const network = await getNetworkFromCookies()
  const contractConfig = getContractConfig(network)
  const { publicClient, agentClient } = getClient(network)

  const { request } = await publicClient.simulateContract({
    account: agentAccount,
    ...contractConfig,
    functionName: 'slashPublisher',
    args: [BigInt(publicationId), verdictCid]
  })

  await agentClient.writeContract(request)

  // 3. Notify the community
  const message =
    `🔨 *BioVerify Alert: Publisher Slashed*\n\n` +
    `*Publication:* #${publicationId}\n` +
    `*Action:* Automatic Protocol Slash\n` +
    `*Reason:* Critical Violation / Plagiarism Detected\n\n` +
    `📝 *Verdict Summary:*\n` +
    `> ${reason.slice(0, 500)}${reason.length > 500 ? '...' : ''}\n\n` +
    `🔗 [View Full Verdict](${PINATA_IPFS_URL}/${verdictCid})\n` +
    `🔗 [View Manifest](${PINATA_IPFS_URL}/${rootCid})`

  await sendTelegramNotification(message)

  console.log(`🔨 Agent Slashed Publisher #${publicationId} | Verdict: ${verdictCid}`)
}