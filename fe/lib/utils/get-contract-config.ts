import { bioVerifyContractConfig } from "@/app/_contracts/config"
import { NetworkT } from "@/app/_schemas/network"

/**
 * Get contract address & abi by network
 */
export const getContractConfig = (network: NetworkT) => {
  return bioVerifyContractConfig[network]
}
