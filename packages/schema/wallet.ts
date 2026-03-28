import { z } from "zod"
import { EthAddressSchema } from "./eth-address"
import { NetworkSchema } from "./network"

export const WalletSchema = z.object({
	address: EthAddressSchema,
	network: NetworkSchema,
})

