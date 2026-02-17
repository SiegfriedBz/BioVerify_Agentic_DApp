'server-only'

import { sendTelegramNotification } from "@/lib/notifications/telegram"
import { getContractConfig } from "@/lib/utils/get-contract-config"
import { getNetworkFromCookies } from "@/lib/wagmi/get-network-from-cookies"
import { agentAccount, getClient } from "../utils/viem-client"

const PINATA_IPFS_URL = process.env.NEXT_PUBLIC_PINATA_IPFS_URL ?? ""

type BaseParams = {
  publicationId: string
  rootCid: string
}

type slashPublisherParams = BaseParams & {
  reason: string
}
export const slashPublisher = async (params: slashPublisherParams) => {
  const { publicationId, reason, rootCid } = params
  console.log(`🔨 Agent Slashing Publisher for Publication #${publicationId}`)

  // 1. Call BioVerify.slashPublisher
  const network = await getNetworkFromCookies()
  const contractConfig = getContractConfig(network)
  const { publicClient, agentClient } = getClient(network)

  const { request } = await publicClient.simulateContract({
    account: agentAccount,
    ...contractConfig,
    functionName: 'slashPublisher',
    args: [BigInt(publicationId)]
  })

  await agentClient.writeContract(request)

  // 2. Notify the community immediately
  await sendTelegramNotification(
    `🚨 *BioVerify Alert: Slash Executed*\n\n` +
    `Publication: #${publicationId}\n` +
    `Verdict: Plagiarism Detected\n` +
    `Evidence:\n\n` +
    `> ${reason.slice(0, 500)}...\n` +
    `IPFS Manifest Link::\n\n` +
    ` ${PINATA_IPFS_URL}/${rootCid}`
  )
}
