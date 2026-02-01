"use client";

import { seiTestnet, sepolia } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { cookieStorage, createStorage, http } from "@wagmi/core";

// TODO add custom RPC URLs
// https://docs.reown.com/appkit/next/core/custom-networks
// const ALCHEMY_ETH_SEPOLIA_RPC_URL =
// 	process.env.NEXT_PUBLIC_ALCHEMY_ETH_SEPOLIA_RPC_URL;
// const ALCHEMY_SEI_TESTNET_RPC_URL =
// 	process.env.NEXT_PUBLIC_ALCHEMY_SEI_TESTNET_RPC_URL;

const RAINBOWKIT_PROJECT_ID =
	process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || "";

const networks = [sepolia, seiTestnet];

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
	storage: createStorage({
		storage: cookieStorage,
	}),
	ssr: true,
	projectId: RAINBOWKIT_PROJECT_ID,
	networks,
});

export const reownConfig = wagmiAdapter.wagmiConfig;
