'server-only'

import { getNetworkFromCookies } from "@/lib/wagmi/get-network-from-cookies"
import { sendTelegramNotification } from "../../notifications/telegram"
import { getContractConfig } from "../../utils/get-contract-config"
import { agentAccount, getClient } from "../utils/viem-client"

const PINATA_IPFS_URL = process.env.NEXT_PUBLIC_PINATA_IPFS_URL ?? ""

type SettleParams = {
  publicationId: string
  rootCid: string
  reason: string
  honestAddresses: string[]
  negligentAddresses: string[]
}

// function publishPublication(uint256 _pubId, address[] calldata _honest, address[] calldata _negligent)
export const publishPublication = async (params: SettleParams) => {
  const {
    publicationId,
    rootCid,
    reason,
    honestAddresses: honest,
    negligentAddresses: negligent
  } = params

  console.log(`🔨 Agent publish Publication #${publicationId}`)
  console.log(`Honest (Reward): ${honest.join(', ')}`)
  console.log(`Negligent (Slash): ${negligent.join(', ')}`)

  // 1. Call BioVerify.publishPublication
  const network = await getNetworkFromCookies()
  const contractConfig = getContractConfig(network)

  const { publicClient, agentClient } = getClient(network)

  const { request } = await publicClient.simulateContract({
    account: agentAccount,
    ...contractConfig,
    functionName: 'publishPublication',
    args: [BigInt(publicationId), honest, negligent]
  })

  await agentClient.writeContract(request)

  // 2. Notify the community immediately
  await sendTelegramNotification(
    `✅ *BioVerify Alert: Publication Passed Review Successfully*\n\n` +
    `Publishing Publication: #${publicationId}\n` +
    `Honest (Reward): ${honest.join(', ')}\n` +
    `Negligent (Slash): ${negligent.join(', ')}\n` +
    `Evidence:\n\n` +
    `> ${reason.slice(0, 500)}...\n` +
    `IPFS Manifest Link::\n\n` +
    ` ${PINATA_IPFS_URL}/${rootCid}`
  )
}
