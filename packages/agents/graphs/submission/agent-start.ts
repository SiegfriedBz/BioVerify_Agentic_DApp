import { earlySlashPublicationCommand, pickReviewersCommand } from "@packages/cqrs"
import { env } from "@packages/env"
import { networkMessage, sendTelegramNotification } from "@packages/notifications"
import { HumanDecisionSchema, NetworkT } from "@packages/schema"
import { AgentType, getThreadId } from "@packages/utils"
import 'server-only'
import { submissionGraph } from "./graph"

const PINATA_IPFS_URL = env.NEXT_PUBLIC_PINATA_IPFS_URL || "https://ipfs.io/ipfs"

type Params = {
  network: NetworkT
  publicationId: string
  rootCid: string
}

export const startSubmissionAgent = async (
  params: Params,
) => {
  const { network, publicationId, rootCid } = params

  try {
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
    const threadId = getThreadId({
      type: AgentType.SUBMISSION,
      publicationId, rootCid
    })
    const config = { configurable: { thread_id: threadId } }

    console.log(`[Submission Agent] Starting LangGraph for Pub #${publicationId} (Thread: ${threadId})`)

    const finalState = await submissionGraph.invoke({ publicationId, rootCid }, config)

    // 3. Handle the Verdict
    if (finalState.verdict.decision === HumanDecisionSchema.enum.fail) {
      console.log(`[Submission Agent] Initiating early slash for #${publicationId}`)
      // CQRS Command
      await earlySlashPublicationCommand({ network, publicationId, reason: finalState.verdict.reason ?? "", rootCid })

    } else {
      console.log(`[Submission Agent] Passing validation for #${publicationId}. Picking reviewers...`)
      // CQRS Command
      await pickReviewersCommand({ network, publicationId, rootCid })
    }

  } catch (error: any) {
    console.error(`[CRITICAL ERROR] [Submission Agent] crashed for Pub #${publicationId}:`, error)

    await sendTelegramNotification(
      `🚨 *BioVerify SUBMISSION AGENT CRASHED*\n` +
      `*Pub:* #${publicationId}\n` +
      `*Error:* ${error?.message || "Unknown error"}`
    ).catch(() => { })

    throw error // Re-throw
  }
}
