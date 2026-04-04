import { InnGestEvents } from "@packages/schema"
import { inngest } from "../../client"

export const auditComplete = inngest.createFunction(
	{
		id: "audit-complete",
		name: "BioVerify Publication AI Audit Complete",
		retries: 3,
		triggers: [{ event: InnGestEvents.SUBMISSION_AGENT_AUDIT_COMPLETED }],
	},
	async ({ event, step }) => {
		const { publicationId } = event.data

		console.log(`Inngest aiAuditComplete for Publication ${publicationId}`)
	},
)
