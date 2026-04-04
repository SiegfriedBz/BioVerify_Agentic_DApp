import { NetworkSchema, type NetworkT } from "@packages/schema"
import "server-only"
import {
	baseSepoliaAgentClient,
	baseSepoliaPublicClient,
	sepoliaAgentClient,
	sepoliaPublicClient,
} from "./viem-config"

/**
 * HELPER: Get Viem Client by network
 */
export const getViemClient = (network: NetworkT) => {
	if (network === NetworkSchema.enum.base_sepolia)
		return {
			publicClient: baseSepoliaPublicClient,
			agentClient: baseSepoliaAgentClient,
		}
	if (network === NetworkSchema.enum.eth_sepolia)
		return {
			publicClient: sepoliaPublicClient,
			agentClient: sepoliaAgentClient,
		}

	throw new Error("Unsupported Chain ID")
}
