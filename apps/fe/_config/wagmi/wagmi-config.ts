/**
 * @title Wagmi & Reown Configuration
 * @notice This file configures the Web3 provider layer, handling multi-chain 
 * connectivity, replay protection, and server-side state hydration.
 * * High-Reliability Features:
 * 1. EIP-155 Replay Protection: Ensures transactions are chain-specific.
 * 2. CAIP-2 Compliance: Universal chain identification for Reown/AppKit.
 * 3. SSR Optimization: Cookie-based hydration to prevent UI "flicker."
 */

import { env } from "@packages/env"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { baseSepolia, sepolia } from "@reown/appkit/networks"
import { cookieStorage, createStorage } from "@wagmi/core"
import { http } from "wagmi"

// --- Alchemy Configuration ---
const ALCHEMY_BASE_SEPOLIA_RPC_URL = env.NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_RPC_URL
const ALCHEMY_ETH_SEPOLIA_RPC_URL = env.NEXT_PUBLIC_ALCHEMY_ETH_SEPOLIA_RPC_URL

const RAINBOWKIT_PROJECT_ID = env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || ""
const networks = [sepolia, baseSepolia]

/**
 * @notice Custom RPC Map using CAIP-2 (Chain Agnostic Improvement Proposals)
 * @dev CAIP-2 uses a `namespace:reference` format (e.g., "eip155:84532").
 * * Namespace (eip155): Identifies the EVM ecosystem based on EIP-155 standards, 
 * which prevent replay attacks by incorporating the Chain ID into the $v$ 
 * value of the ECDSA signature.
 * * Mapping these here ensures the Reown/AppKit Modal uses our dedicated Alchemy 
 * nodes for balance checks instead of slower public RPCs.
 */
export const customRpcUrls = {
	"eip155:84532": [
		{
			url: ALCHEMY_BASE_SEPOLIA_RPC_URL || baseSepolia.rpcUrls.default.http[0],
		},
	],
	"eip155:11155111": [
		{ url: ALCHEMY_ETH_SEPOLIA_RPC_URL || sepolia.rpcUrls.default.http[0] },
	],
}

/**
 * @notice Wagmi Adapter Instance
 * @dev This adapter bridges Wagmi hooks with the Reown (formerly WalletConnect) AppKit.
 * * SSR & Storage:
 * - `ssr: true`: Enables hydration-safe rendering.
 * - `cookieStorage`: Persists session state in HTTP headers, allowing the server 
 * to recognize the user's wallet before the JS bundle loads, preventing UI flicker.
 * * Transports:
 * - HTTP-only via Alchemy. Real-time event subscriptions (WebSocket) are handled
 *   separately by standalone viem clients in `@/_config/viem/ws-clients.ts`,
 *   decoupled from wallet state so they work for all visitors.
 */
export const wagmiAdapter = new WagmiAdapter({
	storage: createStorage({
		storage: cookieStorage,
	}),
	ssr: true,
	projectId: RAINBOWKIT_PROJECT_ID,
	networks,
	customRpcUrls,
	transports: {
		[baseSepolia.id]: http(ALCHEMY_BASE_SEPOLIA_RPC_URL),
		[sepolia.id]: http(ALCHEMY_ETH_SEPOLIA_RPC_URL),
	},
})

export const reownConfig = wagmiAdapter.wagmiConfig