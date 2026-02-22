"use client"

import { useReadContract } from "wagmi"
import { ProtocolPublicationMapper } from "../_schemas/mappers/protocol-publication-mapper"
import { ProtocolPublication } from "../_schemas/schemas/contract/protocol-publication"
import { ReviewerRole, ReviewerRoleSchema } from "../_schemas/schemas/reviewer-role"
import { useContractConfig } from "./use-contract-config"

type Params = {
	reviewerAddress: `0x${string}`
	publicationId: string | number | bigint
}

export const useReviewerRole = (params: Params): ReviewerRole => {
	const { reviewerAddress,
		publicationId } = params

	const contractConfig = useContractConfig()

	const { data, isLoading, isError, error, isFetched } = useReadContract({
		...contractConfig,
		functionName: 'getPublication',
		args: [BigInt(publicationId)],
		query: {
			enabled: !!publicationId,
		}
	})

	if (error) {
		console.error("useReviewerRole Error: ", error)
		return ReviewerRoleSchema.enum.peer
	}

	const rawPublication = data as unknown as ProtocolPublication

	const publication = ProtocolPublicationMapper(rawPublication)

	return publication.seniorReviewer?.toLowerCase() === reviewerAddress.toLowerCase() ?
		ReviewerRoleSchema.enum.senior : ReviewerRoleSchema.enum.peer
}