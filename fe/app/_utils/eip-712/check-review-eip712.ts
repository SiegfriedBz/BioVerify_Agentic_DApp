'server-only'

import { HumanFullReview } from "@/app/_schemas/schemas/langchain/review"
import { NetworkT } from "@/app/_schemas/schemas/network"
import { EIP712_HUMAN_REVIEW_TYPES, EIP712_PRIMARY_TYPE } from "@/app/_utils/eip-712/constants"
import { getEip712Domain } from "@/app/_utils/eip-712/get-eip712-domain"
import { verifyTypedData } from "viem"

type Params = {
  threadId: string
  network: NetworkT
  review: HumanFullReview
  signature: `0x${string}` // The hex signature from the wallet
}

export const checkRewiewEip712 = async (params: Params) => {
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