import { startSubmissionAgent } from "@packages/agents"
import { InnGestEvents } from "@packages/schema"
import { inngest } from "../../client"

export const auditPublicationSubmission = inngest.createFunction(
	{
		id: "audit-publication-submission",
		name: "BioVerify Publication AI Audit",
		retries: 3,
		triggers: [{ event: InnGestEvents.CHAIN_SUBMISSION_RECEIVED }],
	},
	async ({ event, step }) => {
		const { network, publicationId, rootCid } = event.data

		console.log(
			`Inngest auditPublicationSubmission for Publication ${publicationId}`,
		)

		// Durable execution of AI Submission Agent
		await step.run("run-submission-agent", async () => {
			return await startSubmissionAgent({
				network,
				publicationId,
				rootCid,
			})
		})

		// Send event after successful AI Submission Agent execution
		await step.sendEvent(InnGestEvents.SUBMISSION_AGENT_AUDIT_COMPLETED, {
			name: InnGestEvents.SUBMISSION_AGENT_AUDIT_COMPLETED,
			data: {
				publicationId: event.data.publicationId,
			},
		})
	},
)
