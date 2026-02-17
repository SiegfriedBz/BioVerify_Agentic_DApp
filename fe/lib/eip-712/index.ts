
import { NetworkT, NetworkToChainId } from "@/app/_schemas/network"
import { getContractConfig } from "../utils/get-contract-config"

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

// The Typed Data Schema
export const HUMAN_REVIEW_TYPES = {
  HumanReview: [
    { name: 'reviewer', type: 'address' },
    { name: 'publicationId', type: 'string' },
    { name: 'rootCid', type: 'string' },
    { name: 'decision', type: 'string' },
    { name: 'reason', type: 'string' },
  ],
} as const
