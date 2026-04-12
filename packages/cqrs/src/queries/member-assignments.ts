import { db } from "@packages/db"
import {
	mapPublication,
	type Publication,
	publicationDbSchema,
} from "@packages/schema"
import { and, count, desc, eq, or, sql } from "drizzle-orm"

export type MemberAssignmentsResponse = {
	items: Publication[]
	totalCount: number
}

export type MemberAssignmentsQueryParams = {
	userAddress: string
	/** When set with `limit`, applies server-side pagination. Omit for full list (client-side table). */
	limit?: number
	offset?: number
}

export async function getMemberAssignments(
	params: MemberAssignmentsQueryParams,
): Promise<MemberAssignmentsResponse> {
	const { userAddress, limit, offset = 0 } = params
	const address = userAddress.toLowerCase()

	const reviewerClause = or(
		sql`${address} = ANY(${publicationDbSchema.reviewers})`,
		eq(publicationDbSchema.seniorReviewer, address),
	)

	const whereClause = and(eq(publicationDbSchema.status, 2), reviewerClause)

	try {
		const listQuery = db
			.select()
			.from(publicationDbSchema)
			.where(whereClause)
			.orderBy(desc(publicationDbSchema.createdAt))

		const [itemsRaw, [totalRes]] = await Promise.all([
			limit === undefined ? listQuery : listQuery.limit(limit).offset(offset),
			db
				.select({ value: count() })
				.from(publicationDbSchema)
				.where(whereClause),
		])

		const items = itemsRaw.reduce((acc: Publication[], raw) => {
			try {
				acc.push(mapPublication(raw))
			} catch (e) {
				console.error(`[CQRS] Mapping failed for publication ${raw.id}:`, e)
			}
			return acc
		}, [])

		return {
			items,
			totalCount: totalRes.value,
		}
	} catch (error) {
		console.error("[CQRS] getMemberAssignments Failed:", error)
		return { items: [], totalCount: 0 }
	}
}
