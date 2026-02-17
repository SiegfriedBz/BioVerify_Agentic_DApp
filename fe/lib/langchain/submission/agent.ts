'server-only'

import { pickReviewers } from "@/lib/protocol/submission/pick-reviewers"
import { slashPublisher } from "@/lib/protocol/submission/slash-publisher"
import { getThreadId } from "@/lib/utils/get-thread-id"
import { HumanDecisionSchema } from "../review/state"
import { submissionGraph } from "./graph"

type Params = {
  publicationId: string
  rootCid: string
}

export const startSubmissionAgent = async (
  params: Params,
) => {
  const { publicationId, rootCid } = params

  const threadId = getThreadId({ publicationId, rootCid })

  const config = { configurable: { thread_id: threadId } }

  // 1. Run the Graph
  const finalState = await submissionGraph.invoke({ publicationId, rootCid }, config)

  // 2. Handle the Verdict
  if (finalState.verdict.decision === HumanDecisionSchema.enum.fail) {
    // Call Smart Contract's 'slashPublisher' function
    await slashPublisher({ publicationId, reason: finalState.verdict.reason ?? "", rootCid })

  } else {
    // Call Smart Contract's 'pickReviewers' function
    await pickReviewers({ publicationId, rootCid })
  }
}
