import { db } from "@packages/db"
import { mapMember, type Member, memberDbSchema } from "@packages/schema"
import { inArray } from "drizzle-orm"

type Params = {
  ids: string[] // "chainId-address"[]
}

export async function getMembersByIds(params: Params): Promise<Member[]> {
  const { ids } = params

  if (!ids?.length) return []

  try {
    const rawMembers = await db
      .select()
      .from(memberDbSchema)
      .where(inArray(memberDbSchema.id, ids))

    return rawMembers.map(mapMember)
  } catch (error) {
    console.error("[CQRS] getMembersByIds Failed:", error)
    return []
  }
}