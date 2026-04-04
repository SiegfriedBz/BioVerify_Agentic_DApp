import type { PublicationsQueryParams } from "../../../_api/queries"

export const publicationsKeys = {
	all: ["publications"] as const,
	list: (filters: PublicationsQueryParams) =>
		[...publicationsKeys.all, "list", filters] as const,
	detail: (id: string) => [...publicationsKeys.all, "detail", id] as const,
}
