export enum AgentType {
	SUBMISSION = "SUBMISSION",
	REVIEW = "REVIEW",
}

const DELIMITER = "::"

type Params = {
	type: AgentType
	publicationId: string | number
	rootCid: string
}

/**
 * Generates a unique, namespaced threadId for LangGraph.
 * Format: AGENT_TYPE::PUB_ID::ROOT_CID
 */

export const getThreadId = (params: Params): string => {
	const { type, publicationId, rootCid } = params
	return [type, publicationId.toString(), rootCid].join(DELIMITER)
}

/**
 * Reverses a threadId back into its constituent parts.
 */
export const parseThreadId = (threadId: string) => {
	const [type, publicationId, rootCid] = threadId.split(DELIMITER)

	if (!type || !publicationId || !rootCid) {
		throw new Error(`Invalid threadId format: ${threadId}`)
	}

	return {
		type: type as AgentType,
		publicationId,
		rootCid,
	}
}
