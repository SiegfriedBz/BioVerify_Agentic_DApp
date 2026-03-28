import { db } from "@packages/db"
import { mapPublication, type Publication, publicationDbSchema } from "@packages/schema"
import { and, eq, sql } from "drizzle-orm"

export type MemberAssignments = Publication[]

type Params = {
  userAddress: string
}

export async function getMemberAssignments(params: Params): Promise<MemberAssignments> {
  const { userAddress } = params
  const address = userAddress.toLowerCase()

  try {
    // 1. Database-level filtering 
    // Filters for: Status = IN_REVIEW (2) AND (User is in reviewers array OR is seniorReviewer)
    const rawItems = await db
      .select()
      .from(publicationDbSchema)
      .where(
        and(
          eq(publicationDbSchema.status, 2),
          sql`${address} = ANY(${publicationDbSchema.reviewers}) OR ${publicationDbSchema.seniorReviewer} = ${address}`
        )
      )

    // 2. Map results
    const assignments = rawItems.reduce((acc: Publication[], raw) => {
      try {
        acc.push(mapPublication(raw))
      } catch (e) {
        console.error(`[CQRS] Mapping failed for publication ${raw.id}:`, e)
      }
      return acc
    }, [])

    return assignments
  } catch (error) {
    console.error("[CQRS] getMemberAssignments Failed:", error)
    return []
  }
}