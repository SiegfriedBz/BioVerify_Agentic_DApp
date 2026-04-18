import { db } from "@packages/db"
import {
	mapPublication,
	type Publication,
	type PublicationsResponse,
	publicationDbSchema,
} from "@packages/schema"
import { and, count, desc, eq } from "drizzle-orm"

export type PublicationsQueryParams = {
	limit?: number
	offset?: number
	chainId?: number
	status?: number
}

/**
 * Fetches a paginated list of publications with optional filtering.
 */
export async function getPublications(
	searchParams: PublicationsQueryParams = {},
): Promise<PublicationsResponse> {
	const { limit = 10, offset = 0, chainId, status } = searchParams

	try {
		// 1. Build Filters
		const filters = []
		if (chainId) filters.push(eq(publicationDbSchema.chainId, chainId))
		if (status !== undefined)
			filters.push(eq(publicationDbSchema.status, status))

		const whereClause = filters.length > 0 ? and(...filters) : undefined

		// 2. Execute Data and Count queries in parallel
		const [itemsRaw, [totalRes]] = await Promise.all([
			db
				.select()
				.from(publicationDbSchema)
				.where(whereClause)
				.limit(limit)
				.offset(offset)
				.orderBy(desc(publicationDbSchema.createdAt)),
			db
				.select({ value: count() })
				.from(publicationDbSchema)
				.where(whereClause),
		])

		// 3. Map to UI-ready format
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
		console.error("[CQRS] getPublications Failed:", error)
		return { items: [], totalCount: 0 }
	}
}
