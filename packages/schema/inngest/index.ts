export enum InnGestEvents {
	CHAIN_SUBMISSION_RECEIVED = "CHAIN_SUBMISSION_RECEIVED",
	SUBMISSION_AGENT_AUDIT_COMPLETED = "SUBMISSION_AGENT_AUDIT_COMPLETED",
	CHAIN_PICKED_REVIEWERS_RECEIVED = "CHAIN_PICKED_REVIEWERS_RECEIVED",
}

export type BioVerifyInnGestEvents = {
	// SUBMISION AGENT
	[InnGestEvents.CHAIN_SUBMISSION_RECEIVED]: {
		data: {
			network: string
			publicationId: string
			rootCid: string
		}
	}
	[InnGestEvents.SUBMISSION_AGENT_AUDIT_COMPLETED]: {
		data: {
			publicationId: string
		}
	}

	// REVIEW AGENT
	[InnGestEvents.CHAIN_PICKED_REVIEWERS_RECEIVED]: {
		data: {
			network: string
			publicationId: string
			rootCid: string
			reviewers: string[]
			seniorReviewer: string
		}
	}
}

export type InngestTrigger = {
	send: (event: { name: InnGestEvents; data: any }) => Promise<any>
}
