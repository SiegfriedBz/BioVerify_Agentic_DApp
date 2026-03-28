"use client"

import { reownConfig } from "@/_config/wagmi/wagmi-config"
import { sendReviewToAgent } from "@/_lib/commands/send-review-to-agent"
import { Publication } from "@packages/schema"
import { ChainIdToNetwork, EIP712_HUMAN_REVIEW_TYPES, EIP712_PRIMARY_TYPE, getEip712Domain } from "@packages/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { signTypedData } from "@wagmi/core"
import { toast } from "sonner"
import { assignmentKeys } from "../query-keys/assignments-keys"
import { membersKeys } from "../query-keys/members-keys"
import { publicationsKeys } from "../query-keys/publications-keys"
import { statsKeys } from "../query-keys/stats-keys"

type ReviewArgs = {
  decision: "pass" | "fail"
  reason: string
  reviewer: `0x${string}`
  publication: {
    pubId: number
    cid: string
    chainId: number
    seniorReviewer: string
  }
}

export const useSubmitReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (args: ReviewArgs) => {
      const { decision, reason, reviewer, publication } = args
      const network = ChainIdToNetwork[publication.chainId]

      // 1. Sign (Client Side)
      const signature = await signTypedData(reownConfig, {
        domain: getEip712Domain(network),
        types: EIP712_HUMAN_REVIEW_TYPES,
        primaryType: EIP712_PRIMARY_TYPE,
        message: {
          reviewer,
          publicationId: publication.pubId.toString(),
          rootCid: publication.cid,
          decision,
          reason
        },
      })

      toast.info("Signature verified. Handing off to Agent...")

      // 2. Execute SendReviewToAgent
      return await sendReviewToAgent({
        isSeniorReviewer: publication.seniorReviewer?.toLowerCase() === reviewer.toLowerCase(),
        publicationId: publication.pubId.toString(),
        rootCid: publication.cid,
        network,
        address: reviewer,
        decision, // matches HumanDecision
        reason,
        signature
      })
    },
    onSuccess: (data, variables) => {

      const pubId = variables.publication.pubId.toString()

      // 1. Optimistically update the cache immediately
      queryClient.setQueryData(
        publicationsKeys.detail(pubId),
        (old: Publication) => ({
          ...old,
          reviewersStatus: { ...old?.reviewersStatus, [variables.reviewer.toLowerCase()]: true }
        })
      )

      toast.success("Review sent to AI Agent!")

      // 2. Schedule a background invalidation to ensure sync with the actual Neon DB
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: publicationsKeys.detail(pubId) })
        queryClient.invalidateQueries({ queryKey: membersKeys.all })
        queryClient.invalidateQueries({ queryKey: statsKeys.all })
        queryClient.invalidateQueries({ queryKey: assignmentKeys.byUser(variables.reviewer.toLowerCase()) })
      }, 3000)
    },
    onError: (err: any) => {
      toast.error(err.message || "Review submission failed")
    }
  })
}