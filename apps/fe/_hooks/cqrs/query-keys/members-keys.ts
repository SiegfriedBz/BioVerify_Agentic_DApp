export const membersKeys = {
	all: ["members"] as const,
	byChain: (address: string, chainId: number) =>
		[...membersKeys.all, address?.toLowerCase(), chainId] as const,

	byPublicationStatus: (ids: string[], pubStatus: string) =>
		[...membersKeys.all, { ids: [...ids].sort(), pubStatus }] as const,
}
