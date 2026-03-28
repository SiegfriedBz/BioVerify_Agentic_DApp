import { getAuthFromCookies } from "@/_services/wagmi/get-auth-from-cookies"
import { getStatsByChain } from "@packages/cqrs"
import { redirect } from "next/navigation"
import { ChainStatsContainer } from "./chain-stats-container"

export const ChainStatsWrapper = async () => {
  const { chainId } = await getAuthFromCookies()

  if (!chainId) {
    redirect("/")
  }
  const stats = await getStatsByChain({ chainId })

  return <ChainStatsContainer server={{ initialData: stats, chainId }} />
}


