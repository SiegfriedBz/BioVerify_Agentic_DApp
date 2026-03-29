"use server"

import { resumeReviewersAgent, resumeSeniorReviewerAgent } from "@packages/agents"
import { HumanDecision, NetworkT } from "@packages/schema"
import { AgentType, getThreadId } from "@packages/utils"
import { verifyRewiewEip712 } from "@packages/utils-server"

export type SendReviewToAgentParams = {
  isSeniorReviewer: boolean
  publicationId: string
  rootCid: string
  network: NetworkT
  address: `0x${string}`
  decision: HumanDecision
  reason: string
  signature: `0x${string}`
}

export const sendReviewToAgent = async (params: SendReviewToAgentParams) => {
  const {
    isSeniorReviewer,
    publicationId,
    rootCid,
    network,
    address,
    decision,
    reason,
    signature
  } = params

  const threadId = getThreadId({
    type: AgentType.REVIEW,
    publicationId, rootCid
  })

  const review = {
    address,
    verdict: {
      decision,
      reason
    }
  }

  const message = {
    threadId,
    network,
    review,
    signature
  }

  const isValid = await verifyRewiewEip712(message)

  if (!isValid) {
    throw new Error("checkRewiewEip712 invalid - review was not sent to agent.")
  }

  const resume = isSeniorReviewer ? resumeSeniorReviewerAgent : resumeReviewersAgent

  await resume(message)
}