import type { FC } from "react"
import { getAuthFromCookies } from "@/_services/wagmi/get-auth-from-cookies"
import { ReviewerAssignmentsWalletGate } from "./reviewer-assignments-wallet-gate"

/**
 * Server Component: reads Wagmi cookie state for SSR hints.
 * Client gate merges with live `useConnections()` (see wallet-gate).
 */
export const ReviewWrapper: FC = async () => {
	const { userAddress, chainId } = await getAuthFromCookies()

	return (
		<ReviewerAssignmentsWalletGate
			server={{
				userAddress,
				chainId,
			}}
		/>
	)
}
