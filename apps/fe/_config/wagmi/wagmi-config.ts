import { env } from "@packages/env"
import { baseSepolia, sepolia } from "@reown/appkit/networks"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { cookieStorage, createStorage } from "@wagmi/core"
import { fallback, http, webSocket } from "wagmi"

// Alchemy Https
const ALCHEMY_BASE_SEPOLIA_RPC_URL =
	env.NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_RPC_URL
const ALCHEMY_ETH_SEPOLIA_RPC_URL = env.NEXT_PUBLIC_ALCHEMY_ETH_SEPOLIA_RPC_URL

// Alchemy Websockets
const ALCHEMY_BASE_SEPOLIA_WSS = env.NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_WSS
const ALCHEMY_ETH_SEPOLIA_WSS = env.NEXT_PUBLIC_ALCHEMY_ETH_SEPOLIA_WSS

// Rainbow kit
const RAINBOWKIT_PROJECT_ID = env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || ""

const networks = [sepolia, baseSepolia]

// 1. Define the Custom RPC Map using CAIP-2 compliant IDs
export const customRpcUrls = {
	"eip155:84532": [
		// Base Sepolia
		{
			url: ALCHEMY_BASE_SEPOLIA_RPC_URL || baseSepolia.rpcUrls.default.http[0],
		},
	],
	"eip155:11155111": [
		// Eth Sepolia
		{ url: ALCHEMY_ETH_SEPOLIA_RPC_URL || sepolia.rpcUrls.default.http[0] },
	],
}

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
	storage: createStorage({
		storage: cookieStorage,
	}),
	ssr: true,
	projectId: RAINBOWKIT_PROJECT_ID,
	networks,
	// customRpcUrls passed for the Reown Modal
	customRpcUrls,
	// Transports handle the logic for Wagmi Hooks (useReadContract, useWatchContractEvent)
	transports: {
		[baseSepolia.id]: fallback([
			webSocket(ALCHEMY_BASE_SEPOLIA_WSS),
			http(ALCHEMY_BASE_SEPOLIA_RPC_URL),
		]),
		[sepolia.id]: fallback([
			webSocket(ALCHEMY_ETH_SEPOLIA_WSS), // Priority 1: Instant Event Pushes
			http(ALCHEMY_ETH_SEPOLIA_RPC_URL), // Priority 2: Standard Request Backup
		]),
	},
})

export const reownConfig = wagmiAdapter.wagmiConfig
