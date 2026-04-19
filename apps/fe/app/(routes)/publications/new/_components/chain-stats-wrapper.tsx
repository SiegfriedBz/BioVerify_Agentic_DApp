import { getAuthFromCookies } from "@/_services/wagmi/get-auth-from-cookies"
import { getStatsByChain } from "@packages/cqrs"
import { NetworkToChainId } from "@packages/utils"
import { ChainStatsContainer } from "./chain-stats-container"
import { ChainStatsSkeleton } from "./chain-stats-skeleton"

const DEFAULT_CHAIN_ID = NetworkToChainId.base_sepolia

export const ChainStatsWrapper = async () => {
	const { chainId } = await getAuthFromCookies()

	const effectiveChainId = chainId ?? DEFAULT_CHAIN_ID
	const stats = await getStatsByChain({ chainId: effectiveChainId })

	if (!stats) {
		return <ChainStatsSkeleton />
	}

	return (
		<ChainStatsContainer
			server={{ initialData: stats, chainId: effectiveChainId }}
		/>
	)
}
