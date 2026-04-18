
export const publicationsKeys = {
	all: ["publications"] as const,
	detail: (id: string) => [...publicationsKeys.all, "detail", id] as const,
}
