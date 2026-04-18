import type { NetworkT } from "@packages/schema"
import { BioVerifyContractConfig, NetworkToChainId } from "@packages/utils"

/** Standard EIP-712 Domain */
export const getEip712Domain = (network: NetworkT) => {
	const contractConfig = BioVerifyContractConfig[network]

	return {
		name: "BioVerify Protocol",
		version: "1",
		chainId: NetworkToChainId[network],
		verifyingContract: contractConfig.address,
	} as const
}
