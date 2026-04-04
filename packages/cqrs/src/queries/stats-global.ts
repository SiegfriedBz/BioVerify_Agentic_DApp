import { db } from "@packages/db"
import { memberDbSchema } from "@packages/schema"
import { count } from "drizzle-orm"
import { getProtocols } from "./protocols"
import { getPublications } from "./publications"

export type GlobalAggregateStats = {
	rewardPool: string
	slashedPool: string
	networkCount: number
	activeMembers: number
	totalPublications: number
}

export async function getStatsGlobal(): Promise<GlobalAggregateStats> {
	try {
		const [protocols, [memberRes], pubRes] = await Promise.all([
			getProtocols(),
			db.select({ value: count() }).from(memberDbSchema),
			getPublications({ limit: 1 }), // only need the totalCount field
		])

		// Aggregate pool values from the already-mapped protocols
		const totals = protocols.reduce(
			(acc, p) => ({
				reward: acc.reward + parseFloat(p.rewardPool),
				slash: acc.slash + parseFloat(p.slashPool),
			}),
			{ reward: 0, slash: 0 },
		)

		return {
			rewardPool: totals.reward.toFixed(4),
			slashedPool: totals.slash.toFixed(4),
			networkCount: protocols.length,
			activeMembers: memberRes.value,
			totalPublications: pubRes.totalCount,
		}
	} catch (error) {
		console.error("[CQRS] getGlobalAggregateStats Failed:", error)
		return {
			rewardPool: "0.0000",
			slashedPool: "0.0000",
			networkCount: 0,
			activeMembers: 0,
			totalPublications: 0,
		}
	}
}
