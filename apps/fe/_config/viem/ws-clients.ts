import { env } from "@packages/env"
import { createPublicClient, webSocket } from "viem"
import { baseSepolia, sepolia } from "viem/chains"

/**
 * @title Standalone viem WebSocket Client Factories
 * @notice Creates wallet-independent public clients for real-time event subscriptions.
 * @dev Called inside useEffect to guarantee browser-only execution (no SSR).
 * Each factory returns a fresh client; callers should cache via ref if needed.
 */

export const createBaseSepoliaWsClient = () =>
	createPublicClient({
		chain: baseSepolia,
		transport: webSocket(env.NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_WSS),
	})

export const createEthSepoliaWsClient = () =>
	createPublicClient({
		chain: sepolia,
		transport: webSocket(env.NEXT_PUBLIC_ALCHEMY_ETH_SEPOLIA_WSS),
	})
