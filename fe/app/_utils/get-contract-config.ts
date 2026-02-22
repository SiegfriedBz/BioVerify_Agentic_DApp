import { bioVerifyContractConfig } from "../_config/contracts/contract-config"
import { NetworkT } from "../_schemas/schemas/network"

/**
 * Get contract address & abi by network
 */
export const getContractConfig = (network: NetworkT) => {
  return bioVerifyContractConfig[network]
}
