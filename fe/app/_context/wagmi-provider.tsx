"use client";

// import "@rainbow-me/rainbowkit/styles.css";
import { seiTestnet, sepolia } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { FC, PropsWithChildren } from "react";
import { type Config, cookieToInitialState, WagmiProvider } from "wagmi";
import { wagmiAdapter } from "@/lib/wagmi/config";

const RAINBOWKIT_PROJECT_ID =
	process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || "";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Set up metadata
const metadata = {
	name: "BioVerify",
	description: "BioVerify DApp - AI",
	url: APP_URL,
	icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// Create the modal
createAppKit({
	adapters: [wagmiAdapter],
	projectId: RAINBOWKIT_PROJECT_ID,
	networks: [seiTestnet, sepolia],
	defaultNetwork: sepolia,
	metadata: metadata,
	features: {
		analytics: true, // Optional - defaults to your Cloud configuration
	},
});

type Props = {
	cookies: string | null;
};

const queryClient = new QueryClient();

export const CustomWagmiProvider: FC<PropsWithChildren<Props>> = (props) => {
	const { children, cookies } = props;

	const initialState = cookieToInitialState(
		wagmiAdapter.wagmiConfig as Config,
		cookies,
	);

	return (
		<WagmiProvider
			config={wagmiAdapter.wagmiConfig as Config}
			initialState={initialState}
		>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</WagmiProvider>
	);
};

export default CustomWagmiProvider;
