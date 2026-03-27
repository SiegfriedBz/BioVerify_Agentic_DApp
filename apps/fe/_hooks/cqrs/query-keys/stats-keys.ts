export const statsKeys = {
  all: ["stats"] as const,
  byChain: (chainId: number) =>
    [...statsKeys.all, chainId] as const,
}
