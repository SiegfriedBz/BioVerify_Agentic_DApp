export const protocolsKeys = {
  all: ["protocols"] as const,
  list: (filters: object) => [...protocolsKeys.all, "list", filters] as const,
  byChain: (chainId: number) => [...protocolsKeys.all, "detail", chainId] as const,
}