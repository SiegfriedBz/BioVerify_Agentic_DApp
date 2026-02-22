'server-only'

import { HumanDecisionSchema } from "@/app/_schemas/schemas/langchain/review"
import { getThreadId } from "@/app/_utils/get-thread-id"
import { pickReviewers } from "@/app/api/contract/submission/pick-reviewers"
import { slashPublisher } from "@/app/api/contract/submission/slash-publisher"
import { sendTelegramNotification } from "@/app/api/telegram/send-notification"
import { submissionGraph } from "./graph"

const PINATA_IPFS_URL = process.env.NEXT_PUBLIC_PINATA_IPFS_URL ?? ""

type Params = {
  publicationId: string
  rootCid: string
}

export const startSubmissionAgent = async (
  params: Params,
) => {
  const { publicationId, rootCid } = params

  // 1. Notify the community
  const message =
    `📥 *BioVerify Alert: New Submission*\n\n` +
    `*Publication:* #${publicationId}\n` +
    `*Phase:* Registration Complete\n\n` +
    `🔗 [View Research Manifest](${PINATA_IPFS_URL}/${rootCid})\n\n` +
    `🔍 *Next Step:* \n` +
    `The AI Agent is now performing automated plagiarism and integrity checks.\n\n` +
    `🧪 _Awaiting automated audit trail..._`

  await sendTelegramNotification(message)

  // 2. Run the Graph
  const threadId = getThreadId({ publicationId, rootCid })
  const config = { configurable: { thread_id: threadId } }

  const finalState = await submissionGraph.invoke({ publicationId, rootCid }, config)

  // 3. Handle the Verdict
  if (finalState.verdict.decision === HumanDecisionSchema.enum.fail) {
    // Call Smart Contract's 'slashPublisher' function
    await slashPublisher({ publicationId, reason: finalState.verdict.reason ?? "", rootCid })

  } else {
    // Call Smart Contract's 'pickReviewers' function
    await pickReviewers({ publicationId, rootCid })
  }
}
