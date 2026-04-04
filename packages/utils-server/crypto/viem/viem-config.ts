import { env } from "@packages/env"
import "server-only"
import { createPublicClient, createWalletClient, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { baseSepolia, sepolia } from "viem/chains"

const AI_AGENT_PRIVATE_KEY = env.AI_AGENT_PRIVATE_KEY ?? ""
const ALCHEMY_BASE_SEPOLIA_RPC_URL =
	env.NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_RPC_URL ?? ""
const ALCHEMY_ETH_SEPOLIA_RPC_URL =
	env.NEXT_PUBLIC_ALCHEMY_ETH_SEPOLIA_RPC_URL ?? ""

// 1. Setup Account (Shared across chains)
const privateKey = AI_AGENT_PRIVATE_KEY as `0x${string}`
if (!privateKey) throw new Error("AI_AGENT_PRIVATE_KEY is missing from .env")

export const agentAccount = privateKeyToAccount(privateKey)

// 2. BASE_SEPOLIA CLIENTS
export const baseSepoliaPublicClient = createPublicClient({
	chain: baseSepolia,
	transport: http(ALCHEMY_BASE_SEPOLIA_RPC_URL),
})

// BASE_SEPOLIA Signer Client
export const baseSepoliaAgentClient = createWalletClient({
	account: agentAccount,
	chain: baseSepolia,
	transport: http(ALCHEMY_BASE_SEPOLIA_RPC_URL),
})

// 3. ETH_SEPOLIA CLIENTS
export const sepoliaPublicClient = createPublicClient({
	chain: sepolia,
	transport: http(ALCHEMY_ETH_SEPOLIA_RPC_URL),
})

// ETH_SEPOLIA Signer Client
export const sepoliaAgentClient = createWalletClient({
	account: agentAccount,
	chain: sepolia,
	transport: http(ALCHEMY_ETH_SEPOLIA_RPC_URL),
})
