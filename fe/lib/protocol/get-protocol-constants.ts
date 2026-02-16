'server-only'

import { getNetworkFromCookies } from "../wagmi/get-network-from-cookies"
import { ProtocolConstants, ProtocolConstantsSchema } from "./schemas/protocol-constants"
import { sleep } from "./utils/sleep"
import { getClient, getContractConfig } from "./utils/viem-client"

export const getProtocolConstants = async (): Promise<ProtocolConstants> => {
  const network = await getNetworkFromCookies()
  const contractConfig = getContractConfig(network)
  const { publicClient } = getClient(network)

  const contracts = [
    { ...contractConfig, functionName: 'I_AI_AGENT_ADDRESS' },
    { ...contractConfig, functionName: 'I_TREASURY_ADDRESS' },
    { ...contractConfig, functionName: 'I_VRF_NUM_WORDS' },
    { ...contractConfig, functionName: 'I_REPUTATION_BOOST' },
    { ...contractConfig, functionName: 'I_PUBLISHER_MIN_FEE' },
    { ...contractConfig, functionName: 'I_PUBLISHER_MIN_STAKE' },
    { ...contractConfig, functionName: 'I_REVIEWER_MIN_STAKE' },
    { ...contractConfig, functionName: 'I_REVIEWER_REWARD' },
    { ...contractConfig, functionName: 'I_MIN_REVIEWS_COUNT' },
  ]

  const results = await publicClient.multicall({ contracts })

  // Map to the object format our Mapper expects
  const data: ProtocolConstants = {
    agentAddress: results[0].status === "success" ? results[0].result as string : "",
    treasuryAddress: results[1].status === "success" ? results[1].result as string : "",
    numWords: results[2].status === "success" ? results[2].result as bigint : 0n,
    reputationBoost: results[3].status === "success" ? results[3].result as bigint : 0n,
    publisherMinfee: results[4].status === "success" ? results[4].result as bigint : 0n,
    publisherMinStake: results[5].status === "success" ? results[5].result as bigint : 0n,
    reviewerMinStake: results[6].status === "success" ? results[6].result as bigint : 0n,
    reviewerReward: results[7].status === "success" ? results[7].result as bigint : 0n,
    minReviewsCount: results[8].status === "success" ? results[8].result as bigint : 0n
  }

  return ProtocolConstantsSchema.parse(data)
}

// Mock
export const getProtocolConstantsMock = async (): Promise<ProtocolConstants> => {
  await sleep()

  return ProtocolConstantsSchema.parse({
    agentAddress: "0x68e4A234de215F3c5115E1bEa9a005CC1d9eC1cB",
    treasuryAddress: "0x68e4A234de215F3c5115E1bEa9a005CC1d9eC1cB",
    numWords: 6n,
    reputationBoost: 500n,
    publisherMinfee: 1000n,
    publisherMinStake: 8000000000n,
    reviewerMinStake: 1000n,
    reviewerReward: 500n,
    minReviewsCount: 5n,
  })
}