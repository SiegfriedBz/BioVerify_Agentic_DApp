import { NetworkT, NetworkToChainId } from "@/app/_schemas/schemas/network"
import { getContractConfig } from "../get-contract-config"

/** Standard EIP-712 Domain */
export const getEip712Domain = (network: NetworkT) => {
  const contractConfig = getContractConfig(network)

  return {
    name: 'BioVerify Protocol',
    version: '1',
    chainId: NetworkToChainId[network],
    verifyingContract: contractConfig.address
  } as const
}
