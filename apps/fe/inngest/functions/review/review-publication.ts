import { startReviewersAgent } from "@packages/agents"
import { InnGestEvents } from "@packages/schema"
import { inngest } from "../../client"

export const reviewPublication = inngest.createFunction(
	{
		id: "review-publication",
		name: "BioVerify Publication Human Review",
		retries: 3,
		triggers: [{ event: InnGestEvents.CHAIN_PICKED_REVIEWERS_RECEIVED }],
	},
	async ({ event, step }) => {
		const { network, publicationId, rootCid, reviewers, seniorReviewer } =
			event.data

		console.log(`Inngest reviewPublication for Publication ${publicationId}`)

		// Durable execution of AI Review Agent
		await step.run("run-review-agent", async () => {
			return await startReviewersAgent({
				publicationId,
				rootCid,
				reviewers,
				seniorReviewer,
				network,
			})
		})
	},
)
