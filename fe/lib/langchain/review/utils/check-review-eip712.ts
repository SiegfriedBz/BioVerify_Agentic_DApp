'server-only'

import { NetworkT } from "@/app/_schemas/wallet"
import { getEip712Domain, HUMAN_REVIEW_TYPES } from "@/lib/eip-712"
import { verifyTypedData } from "viem"
import { HumanFullReview } from "../state"

type Params = {
  threadId: string
  network: NetworkT
  review: HumanFullReview["reviewer"]
  signature: `0x${string}` // The hex signature from the wallet

}
export const checkRewiewEip712 = async (params: Params) => {
  const { threadId, network, review, signature } = params
  const bioverifyDomain = getEip712Domain(network)

  const [publicationId, rootCid] = threadId.split('-')

  const isValid = await verifyTypedData({
    domain: bioverifyDomain,
    types: HUMAN_REVIEW_TYPES,
    primaryType: 'HumanReview',
    address: review.address as `0x${string}`,
    message: {
      reviewer: review.address as `0x${string}`,
      decision: review.verdict.decision,
      reason: review.verdict.reason,
      publicationId,
      rootCid,
    },
    signature,
  })

  return isValid
}