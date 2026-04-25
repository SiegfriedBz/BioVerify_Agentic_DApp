import { PublicationsQueryParams } from "@packages/cqrs"

export const publicationsKeys = {
	all: ["publications"] as const,
	byQueryParams: (query: PublicationsQueryParams) => ["publications", query] as const,
	detail: (id: string) => [...publicationsKeys.all, "detail", id] as const,
}
