import { HumanFullReview, NetworkT } from "@packages/schema"
import { EIP712_HUMAN_REVIEW_TYPES, EIP712_PRIMARY_TYPE, getEip712Domain } from "@packages/utils"
import "server-only"
import { verifyTypedData } from "viem"

type Params = {
  threadId: string
  network: NetworkT
  review: HumanFullReview
  signature: `0x${string}` // The hex signature from the wallet
}

export const verifyRewiewEip712 = async (params: Params): Promise<boolean> => {
  const { threadId, network, review, signature } = params
  const bioverifyDomain = getEip712Domain(network)

  const [publicationId, rootCid] = threadId.split('-')

  const isValid = await verifyTypedData({
    domain: bioverifyDomain,
    types: EIP712_HUMAN_REVIEW_TYPES,
    primaryType: EIP712_PRIMARY_TYPE,
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