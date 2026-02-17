'server-only'

import { getContractConfig } from "../utils/get-contract-config"
import { getNetworkFromCookies } from "../wagmi/get-network-from-cookies"
import { ProtocolPublication, ProtocolPublicationSchema, ProtocolPublicationStatusSchema } from "./schemas/protocol-publication"
import { sleep } from "./utils/sleep"
import { getClient } from "./utils/viem-client"

type Params = {
  id: number
}

export const getPublicationDetails = async (params: Params): Promise<ProtocolPublication> => {
  const { id } = params

  const network = await getNetworkFromCookies()
  const contractConfig = getContractConfig(network)
  const { publicClient } = getClient(network)

  // readContract
  const data = await publicClient.readContract({
    ...contractConfig,
    functionName: 'idToPublication',
    args: [BigInt(id)],
  })

  // Parse and Validate
  return ProtocolPublicationSchema.parse(data)
}

// Mock
export const getPublicationDetailsMock = async (): Promise<ProtocolPublication> => {
  await sleep()

  const pub = {
    id: BigInt(1),
    stakes: BigInt(Math.floor(Math.random() * 500)) * 10n ** 18n,
    paidSubmissionFee: 50n * 10n ** 15n,
    publisher: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    // 4 Reviewers + 1 Senior = 5 Total (VRF_NUM_WORDS)
    reviewers: [
      "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc"
    ],
    seniorReviewer: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
    cids: ["QmT4vvigVD7C1gFmr7MaguTexYmfCsNCRR2JvBBru1ykjv"],
    status: ProtocolPublicationStatusSchema.enum.IN_REVIEW
  }

  return ProtocolPublicationSchema.parse(pub)
}