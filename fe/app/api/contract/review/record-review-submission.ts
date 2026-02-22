'server-only'

import { agentAccount } from "@/app/_config/viem/viem-config"
import { getContractConfig } from "@/app/_utils/get-contract-config"
import { getClient } from "@/app/_utils/viem/get-client"
import { getNetworkFromCookies } from "@/app/_utils/wagmi/get-network-from-cookies"

type Params = {
  publicationId: string
  reviewerAddress: string
}

export const recordReviewSubmission = async (params: Params) => {
  const {
    publicationId,
    reviewerAddress
  } = params

  console.log(`🔨 Agent recordReviewSubmission #${publicationId}`)
  console.log(`> Reviewer Address ${reviewerAddress}`)

  // 1. Call BioVerify.recordReviewSubmission
  const network = await getNetworkFromCookies()
  const contractConfig = getContractConfig(network)

  const { publicClient, agentClient } = getClient(network)

  const { request } = await publicClient.simulateContract({
    account: agentAccount,
    ...contractConfig,
    functionName: 'recordReviewSubmission',
    args: [reviewerAddress, BigInt(publicationId)]
  })

  await agentClient.writeContract(request)
}
