import { earlySlashPublicationCommand, pickReviewersCommand } from "@packages/cqrs"
import { env } from "@packages/env"
import { networkMessage, sendTelegramNotification } from "@packages/notifications"
import { HumanDecisionSchema, NetworkT } from "@packages/schema"
import 'server-only'
import { getThreadId } from "../../utils/get-thread-id"
import { submissionGraph } from "./graph"

const PINATA_IPFS_URL = env.NEXT_PUBLIC_PINATA_IPFS_URL ?? ""

type Params = {
  network: NetworkT
  publicationId: string
  rootCid: string
}

export const startSubmissionAgent = async (
  params: Params,
) => {
  const { network, publicationId, rootCid } = params

  // 1. Notify the community
  const message =
    `📥 *BioVerify Alert: New Submission*\n\n` +
    `*Network:* #${networkMessage(network)}\n` +
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
    // CQRS Commqnd
    await earlySlashPublicationCommand({ network, publicationId, reason: finalState.verdict.reason ?? "", rootCid })

  } else {
    // CQRS Commqnd
    await pickReviewersCommand({ network, publicationId, rootCid })
  }
}
