export const protocolsKeys = {
	all: ["protocols"] as const,
	byChain: (chainId: number) =>
		[...protocolsKeys.all, "detail", chainId] as const,
}
