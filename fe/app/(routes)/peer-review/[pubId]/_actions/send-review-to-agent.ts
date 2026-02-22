"use server"

import { resumeReviewersAgent } from "@/app/_langchain/review/resume-reviewers-agent"
import { resumeSeniorReviewerAgent } from "@/app/_langchain/review/resume-senior-reviewer-agent"
import { HumanDecision } from "@/app/_schemas/schemas/langchain/review"
import { NetworkT } from "@/app/_schemas/schemas/network"
import { checkRewiewEip712 } from "@/app/_utils/eip-712/check-review-eip712"
import { getThreadId } from "@/app/_utils/get-thread-id"

type Params = {
  isSeniorReviewer: boolean
  publicationId: string
  rootCid: string
  network: NetworkT
  address: `0x${string}`
  decision: HumanDecision
  reason: string
  signature: `0x${string}`
}

export const sendReviewToAgent = async (params: Params) => {
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

  const threadId = getThreadId({ publicationId, rootCid })

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

  const isValid = await checkRewiewEip712(message)

  if (!isValid) {
    throw new Error("checkRewiewEip712 invalid - review was not sent to agent.")
  }

  const resume = isSeniorReviewer ? resumeSeniorReviewerAgent : resumeReviewersAgent

  await resume(message)
}