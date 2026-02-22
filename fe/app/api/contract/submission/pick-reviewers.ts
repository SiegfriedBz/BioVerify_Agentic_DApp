'server-only'

import { agentAccount } from "@/app/_config/viem/viem-config"
import { getContractConfig } from "@/app/_utils/get-contract-config"
import { getClient } from "@/app/_utils/viem/get-client"
import { getNetworkFromCookies } from "@/app/_utils/wagmi/get-network-from-cookies"
import { sendTelegramNotification } from "@/app/api/telegram/send-notification"

const PINATA_IPFS_URL = process.env.NEXT_PUBLIC_PINATA_IPFS_URL ?? ""

type Params = {
  publicationId: string
  rootCid: string
}

export const pickReviewers = async (params: Params) => {
  const { publicationId, rootCid } = params


  // 1. Call BioVerify.pickReviewers (call VRF)
  const network = await getNetworkFromCookies()
  const contractConfig = getContractConfig(network)
  const { publicClient, agentClient } = getClient(network)

  const { request } = await publicClient.simulateContract({
    account: agentAccount,
    ...contractConfig,
    functionName: 'pickReviewers',
    args: [BigInt(publicationId)]
  })

  await agentClient.writeContract(request)

  // 2. Notify the community
  console.log(`🎲 Agent Triggering VRF for Publication`, JSON.stringify({
    publicationId,
    rootCid
  }))

  const message =
    `🎲 *BioVerify Alert: Review Phase Started*\n\n` +
    `*Publication:* #${publicationId}\n` +
    `*Phase:* AI Validation Passed ✅\n` +
    `*Status:* Requesting random reviewers via Chainlink VRF...\n\n` +
    `🔗 [View Research Manifest](${PINATA_IPFS_URL}/${rootCid})\n\n` +
    `⛓️ _Waiting for cryptographically secure randomness..._`

  await sendTelegramNotification(message)

}