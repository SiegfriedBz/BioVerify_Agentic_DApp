"use client"

import { customRpcUrls, wagmiAdapter } from "@/_config/wagmi/wagmi-config"
import { env } from "@packages/env"
// import "@rainbow-me/rainbowkit/styles.css";
import { baseSepolia, sepolia } from "@reown/appkit/networks"
import { createAppKit } from "@reown/appkit/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { useState, type FC, type PropsWithChildren } from "react"
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi"

const RAINBOWKIT_PROJECT_ID =
  env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || ""
const APP_URL = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

// Set up metadata
const metadata = {
  name: "BioVerify",
  description: "BioVerify Agentic DApp",
  url: APP_URL,
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
}

const networks = [baseSepolia, sepolia] as any
const defaultNetwork = baseSepolia as any

// Create the modal with synchronized RPC settings
createAppKit({
  adapters: [wagmiAdapter],
  projectId: RAINBOWKIT_PROJECT_ID,
  networks: networks,
  defaultNetwork: defaultNetwork,
  metadata: metadata,
  customRpcUrls,
  features: {
    analytics: true,
  },
})

type Props = {
  cookies: string | null
}

export const CustomWagmiProvider: FC<PropsWithChildren<Props>> = (props) => {
  const { children, cookies } = props

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: false,
      },
    },
  }))

  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies,
  )

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>{children}</NuqsAdapter>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default CustomWagmiProvider
