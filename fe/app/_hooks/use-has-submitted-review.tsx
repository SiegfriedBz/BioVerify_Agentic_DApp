"use client"

import { useReadContract } from "wagmi"
import { useContractConfig } from "./use-contract-config"

type Params = {
  reviewerAddress: string | undefined
  publicationId: string | bigint | number
}

export const useHasSubmittedReview = (params: Params) => {
  const { reviewerAddress, publicationId } = params
  const contractConfig = useContractConfig()

  const { data, error, isLoading } = useReadContract({
    ...contractConfig,
    functionName: "hasSubmittedReviewOnPubId",
    args: [reviewerAddress as `0x${string}`, BigInt(publicationId)],

    query: {
      enabled: !!reviewerAddress && !!publicationId
    }
  })

  if (error) {
    console.error("useHasSubmittedReview Error: ", error)
    return { hasSubmitted: false, isLoading: false }
  }

  return {
    hasSubmitted: !!data,
    isLoading
  }
}