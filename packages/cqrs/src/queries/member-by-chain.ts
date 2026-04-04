import { db } from "@packages/db"
import { type Member, mapMember, memberDbSchema } from "@packages/schema"
import { and, eq } from "drizzle-orm"

type Params = {
	userAddress: string
	chainId: number
}

export async function getMemberByChain(params: Params): Promise<Member | null> {
	try {
		const { userAddress, chainId } = params

		const [raw] = await db
			.select()
			.from(memberDbSchema)
			.where(
				and(
					eq(memberDbSchema.address, userAddress.toLowerCase()),
					eq(memberDbSchema.chainId, chainId),
				),
			)
			.limit(1)

		if (!raw) return null

		return mapMember(raw)
	} catch (error) {
		console.error("[CQRS] getMemberByChain Failed:", error)
		return null
	}
}
