'server-only'

import { agentAccount } from "@/app/_config/viem/viem-config"
import { getContractConfig } from "@/app/_utils/get-contract-config"
import { getClient } from "@/app/_utils/viem/get-client"
import { getNetworkFromCookies } from "@/app/_utils/wagmi/get-network-from-cookies"
import { sendTelegramNotification } from "@/app/api/telegram/send-notification"
import { pinText } from "../../pinata/pin-text"

const PINATA_IPFS_URL = process.env.NEXT_PUBLIC_PINATA_IPFS_URL ?? ""

type SettleParams = {
  publicationId: string
  rootCid: string
  reason: string
  honestAddresses: string[]
  negligentAddresses: string[]
}

export const slashPublication = async (params: SettleParams) => {
  const {
    publicationId,
    rootCid,
    reason,
    honestAddresses: honest,
    negligentAddresses: negligent
  } = params

  // 1. Store verdict on IPFS
  const verdictCid = await pinText({
    text: reason,
    fileName: `publication-${publicationId}-review-verdict`
  })

  // 2. Call BioVerify.slashPublication
  const network = await getNetworkFromCookies()
  const contractConfig = getContractConfig(network)
  const { publicClient, agentClient } = getClient(network)

  const { request } = await publicClient.simulateContract({
    account: agentAccount,
    ...contractConfig,
    functionName: 'slashPublication',
    args: [BigInt(publicationId), honest, negligent, verdictCid]
  })

  await agentClient.writeContract(request)

  // 3. Notify the community
  const mask = (addr: string) => `\`${addr.slice(0, 6)}...${addr.slice(-4)}\``

  const honestList = honest.length > 0
    ? honest.map(mask).join(', ')
    : "_None_"

  const negligentList = negligent.length > 0
    ? negligent.map(mask).join(', ')
    : "_None_"

  const message =
    `🚨 *BioVerify Alert: Publication Slashed*\n\n` +
    `*Publication:* #${publicationId}\n` +
    `*Status:* Slashed (Fraudulent/Invalid)\n\n` +
    `⚠️ *Negligent Reviewers (Slashed):*\n${negligentList}\n\n` +
    `🛡️ *Honest Reviewers (Rewarded):*\n${honestList}\n\n` +
    `📝 *Verdict Summary:*\n` +
    `> ${reason.slice(0, 500)}${reason.length > 500 ? '...' : ''}\n\n` +
    `🔗 [View Full Verdict](${PINATA_IPFS_URL}/${verdictCid})\n` +
    `🔗 [View Manifest](${PINATA_IPFS_URL}/${rootCid})`

  await sendTelegramNotification(message)

  console.log(`🚨 Agent Slashed #${publicationId} | Verdict: ${verdictCid}`)
}