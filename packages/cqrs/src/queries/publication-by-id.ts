import { db } from "@packages/db"
import {
	mapPublication,
	type Publication,
	publicationDbSchema,
} from "@packages/schema"
import { eq } from "drizzle-orm"

export type Params = {
	id: string // "chainId-pubId"
}

/**
 * Fetches a single publication by its primary key ID.
 */
export async function getPublicationById(
	params: Params,
): Promise<Publication | null> {
	const { id } = params

	try {
		const [raw] = await db
			.select()
			.from(publicationDbSchema)
			.where(eq(publicationDbSchema.id, id))
			.limit(1)

		if (!raw) return null

		return mapPublication(raw)
	} catch (error) {
		console.error(`[CQRS] getPublicationById Failed for ID ${id}:`, error)
		return null
	}
}
