'server-only'

import { pickReviewers } from "@/lib/protocol/pick-reviewers"
import { slashPublisher } from "@/lib/protocol/slash-publisher"
import { submissionGraph } from "./graph"

type Params = {
  publicationId: string
  rootCid: string
}

export const startSubmissionAgent = async (
  params: Params,
) => {
  const { publicationId, rootCid } = params

  const config = { configurable: { thread_id: `${publicationId}-${rootCid}` } }

  // 1. Run the Graph
  const finalState = await submissionGraph.invoke({ publicationId, rootCid }, config)

  // 2. Handle the Verdict
  if (finalState.verdict.decision === "fail") {
    // Call Smart Contract's 'slashPublisher' function
    await slashPublisher({ publicationId, reason: finalState.verdict.reason ?? "", rootCid })

  } else {
    // Call Smart Contract's 'pickReviewers' function
    await pickReviewers({ publicationId, rootCid })
  }
}
