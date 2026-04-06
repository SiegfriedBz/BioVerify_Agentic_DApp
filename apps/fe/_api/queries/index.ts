"use server"

// CQRS bridge
import {
	getMemberAssignments,
	getMemberByChain,
	getMembersByIds,
	getProtocolByChain,
	getProtocols,
	getPublicationById,
	getPublications,
	getStatsByChain,
	getStatsGlobal,
	type ChainStats,
	type GlobalAggregateStats,
	type MemberAssignmentsResponse,
	type PublicationsQueryParams,
} from "@packages/cqrs"

export {
	getMemberAssignments,
	getMemberByChain,
	getMembersByIds,
	getProtocolByChain,
	getProtocols,
	getPublicationById,
	getPublications,
	getStatsByChain,
	getStatsGlobal,
	type ChainStats,
	type GlobalAggregateStats,
	type MemberAssignmentsResponse,
	type PublicationsQueryParams,
}
