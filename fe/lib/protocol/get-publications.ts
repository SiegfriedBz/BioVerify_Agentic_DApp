'server-only'

import { getContractConfig } from "../utils/get-contract-config"
import { getNetworkFromCookies } from "../wagmi/get-network-from-cookies"
import { ProtocolPublication, ProtocolPublicationSchema } from "./schemas/protocol-publication"
import { sleep } from "./utils/sleep"
import { getClient } from "./utils/viem-client"

export const getPublications = async (): Promise<ProtocolPublication[]> => {
  const network = await getNetworkFromCookies()
  const contractConfig = getContractConfig(network)
  const { publicClient } = getClient(network)

  // 1. Get the total count
  const nextPubId = await publicClient.readContract({
    ...contractConfig,
    functionName: 'nextPubId',
  })

  const length = Number(nextPubId)
  if (length === 0) return []

  // 2. Prepare the batched calls
  const contracts = Array.from({ length }, (_, i) => ({
    ...contractConfig,
    functionName: 'idToPublication',
    args: [BigInt(i)],
  }))

  // 3. Single RPC Request
  const results = await publicClient.multicall({
    contracts,
    allowFailure: true
  })

  // 4. Parse and Validate
  return results
    .filter((res) => res.status === "success")
    .map((res) => ProtocolPublicationSchema.parse(res.result))
}

// Mock
export const getPublicationsMock = async (): Promise<ProtocolPublication[]> => {
  await sleep()

  const statuses: ProtocolPublication["status"][] = [
    "SUBMITTED", "IN_REVIEW", "PUBLISHED", "SLASHED"
  ]

  const pubs = Array.from({ length: 15 }, (_, i) => {
    const status = statuses[i % statuses.length]
    const isSubmitted = status === "SUBMITTED"

    return {
      id: BigInt(i),
      stakes: BigInt(Math.floor(Math.random() * 500)) * 10n ** 18n,
      paidSubmissionFee: 50n * 10n ** 15n,
      publisher: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      // 4 Reviewers + 1 Senior = 5 Total (VRF_NUM_WORDS)
      reviewers: isSubmitted ? [] : [
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc"
      ],
      seniorReviewer: isSubmitted ? undefined : "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
      cids: ["QmT4vvigVD7C1gFmr7MaguTexYmfCsNCRR2JvBBru1ykjv"],
      status: status
    }
  })

  return pubs.map((res) => ProtocolPublicationSchema.parse(res))
}