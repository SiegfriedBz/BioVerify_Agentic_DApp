'server-only'

import { sendTelegramNotification } from "../notifications/telegram"
import { getNetworkFromCookies } from "../wagmi/get-network-from-cookies"
import { agentAccount, getClient, getContractConfig } from "./utils/viem-client"

const PINATA_IPFS_URL = process.env.NEXT_PUBLIC_PINATA_IPFS_URL ?? ""

type BaseParams = {
  publicationId: string
  rootCid: string
}

export const pickReviewers = async (params: BaseParams) => {
  const { publicationId, rootCid } = params

  console.log(`🎲 Agent Triggering VRF for Publication #${publicationId}`)

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

  await sendTelegramNotification(
    `✅ *BioVerify Alert: Review Phase Started*\n\n` +
    `Publication: #${publicationId} passed AI validation.\n` +
    `Status: Selecting 3 random reviewers via Chainlink VRF.` +
    `IPFS Manifest Link: ${PINATA_IPFS_URL}/${rootCid}` +
    `🧪 _Awaiting VRF callback..._`
  )

}