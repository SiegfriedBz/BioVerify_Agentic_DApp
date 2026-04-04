import { db } from "@packages/db"
import { type Member, mapMember, memberDbSchema } from "@packages/schema"

/**
 * Fetches all members
 */
export async function getMembers(): Promise<Member[]> {
	try {
		const rawMembers = await db.select().from(memberDbSchema)

		return rawMembers.reduce((acc: Member[], raw) => {
			try {
				acc.push(mapMember(raw))
			} catch (e) {
				console.error(`[CQRS] Skipping member ${raw.id}:`, e)
			}
			return acc
		}, [])
	} catch (error) {
		console.error("[CQRS] getMembers Failed:", error)
		return []
	}
}
