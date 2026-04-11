"use server"

// CQRS bridge
import {
	type ChainStats,
	type GlobalAggregateStats,
	getMemberAssignments,
	getMemberByChain,
	getMembersByIds,
	getProtocolByChain,
	getProtocols,
	getPublicationById,
	getPublications,
	getStatsByChain,
	getStatsGlobal,
	type MemberAssignmentsResponse,
	type PublicationsQueryParams,
} from "@packages/cqrs"

export {
	type ChainStats,
	type GlobalAggregateStats,
	getMemberAssignments,
	getMemberByChain,
	getMembersByIds,
	getProtocolByChain,
	getProtocols,
	getPublicationById,
	getPublications,
	getStatsByChain,
	getStatsGlobal,
	type MemberAssignmentsResponse,
	type PublicationsQueryParams,
}
