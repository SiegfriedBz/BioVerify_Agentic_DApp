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

// function slashPublication(uint256 _pubId, address[] calldata _honest, address[] calldata _negligent)
export const slashPublication = async (params: SettleParams) => {
  const {
    publicationId,
    rootCid,
    reason,
    honestAddresses: honest,
    negligentAddresses: negligent
  } = params

  console.log(`🔨 Agent slash Publication #${publicationId}`)
  console.log(`Honest (Reward): ${honest.join(', ')}`)
  console.log(`Negligent (Slash): ${negligent.join(', ')}`)


  // 1. Call BioVerify.slashPublication
  const network = await getNetworkFromCookies()
  const contractConfig = getContractConfig(network)
  const { publicClient, agentClient } = getClient(network)

  const { request } = await publicClient.simulateContract({
    account: agentAccount,
    ...contractConfig,
    functionName: 'slashPublication',
    args: [BigInt(publicationId), honest, negligent]
  })

  await agentClient.writeContract(request)

  // 2. Notify the community immediately
  await sendTelegramNotification(
    `🚨  *BioVerify Alert: Publication Review Failed*\n\n` +
    `Slashing Publication: #${publicationId}\n` +
    `Honest (Reward): ${honest.join(', ')}\n` +
    `Negligent (Slash): ${negligent.join(', ')}\n` +
    `Evidence:\n\n` +
    `> ${reason.slice(0, 500)}...\n` +
    `IPFS Manifest Link::\n\n` +
    ` ${PINATA_IPFS_URL}/${rootCid}`
  )
}

