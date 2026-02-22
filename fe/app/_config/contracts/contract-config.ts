
import { NetworkSchema, NetworkT } from "@/app/_schemas/schemas/network"
import { bioVerifyConfigSeiTestNet, bioVerifyConfigSeoplia, ContractConfig } from "./constants"

export const bioVerifyContractConfig: Record<NetworkT, ContractConfig> = {
	[NetworkSchema.enum.sepolia]: bioVerifyConfigSeoplia,
	[NetworkSchema.enum.sei_testnet]: bioVerifyConfigSeiTestNet,
}
