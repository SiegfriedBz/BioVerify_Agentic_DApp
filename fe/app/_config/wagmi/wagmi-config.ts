import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { seiTestnet, sepolia } from "@reown/appkit/networks"
import { cookieStorage, createStorage } from "@wagmi/core"
import { fallback, http, webSocket } from "wagmi"

// Alchemy Https
const ALCHEMY_ETH_SEPOLIA_RPC_URL =
	process.env.NEXT_PUBLIC_ALCHEMY_ETH_SEPOLIA_RPC_URL
const ALCHEMY_SEI_TESTNET_RPC_URL =
	process.env.NEXT_PUBLIC_ALCHEMY_SEI_TESTNET_RPC_URL

// Alchemy Websockets
const ALCHEMY_ETH_SEPOLIA_WSS =
	process.env.NEXT_PUBLIC_ALCHEMY_ETH_SEPOLIA_WSS
const ALCHEMY_SEI_TESTNET_WSS =
	process.env.NEXT_PUBLIC_ALCHEMY_SEI_TESTNET_WSS

// Rainbow kit
const RAINBOWKIT_PROJECT_ID =
	process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || ""


const networks = [sepolia, seiTestnet]

// 1. Define the Custom RPC Map using CAIP-2 compliant IDs
export const customRpcUrls = {
	'eip155:11155111': [ // Sepolia
		{ url: ALCHEMY_ETH_SEPOLIA_RPC_URL || sepolia.rpcUrls.default.http[0] }
	],
	'eip155:1328': [ // Sei Testnet
		{ url: ALCHEMY_SEI_TESTNET_RPC_URL || seiTestnet.rpcUrls.default.http[0] }
	]
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
		[sepolia.id]: fallback([
			webSocket(ALCHEMY_ETH_SEPOLIA_WSS), // Priority 1: Instant Event Pushes
			http(ALCHEMY_ETH_SEPOLIA_RPC_URL),  // Priority 2: Standard Request Backup
		]),
		[seiTestnet.id]: fallback([
			webSocket(ALCHEMY_SEI_TESTNET_WSS),
			http(ALCHEMY_SEI_TESTNET_RPC_URL),
		]),
	},
})

export const reownConfig = wagmiAdapter.wagmiConfig
