import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  /**
   * Helps t3-env distinguish between server and client validation.
   */
  isServer: typeof window === "undefined",

  server: {
    /**
     * BIOVERIFY PROTOCOL & AGENT
     */
    TREASURY_ADDRESS: z.string().describe("Address for fee/slashing collection"),
    AI_AGENT_ADDRESS: z.string().describe("Authorized off-chain orchestrator address"),
    AI_AGENT_PRIVATE_KEY: z.string().describe("ECDSA key for agent-triggered transactions"),
    DEPLOYER_PRIVATE_KEY: z.string().describe("Key for contract deployment"),
    DEPLOY_VALUE: z.coerce.number().describe("Deployment funding in wei"),

    REPUTATION_BOOST: z.string().default("100"),
    PUBLISHER_MIN_FEE: z.string().default("20000000000000000"),
    PUBLISHER_STAKE: z.string().default("5000000000000000"),
    REVIEWER_STAKE: z.string().default("1000000000000000"),
    REVIEWER_REWARD: z.string().default("2000000000000000"),

    VRF_NUM_WORDS: z.coerce.number().default(3),
    ETHERSCAN_API_KEY: z.string(),
    /**
     * CHAINLINK INFRASTRUCTURE
     */
    VRF_BASE_SEPOLIA_SUBSCRIPTION_ID: z.coerce.number(),
    VRF_SEPOLIA_SUBSCRIPTION_ID: z.coerce.number(),

    /**
     * ALCHEMY (WEBHOOKS)
     */
    ALCHEMY_BASE_SEPOLIA_WH_SK: z.string().describe("Webhook Signing Key - Base"),
    ALCHEMY_ETH_SEPOLIA_WH_SK: z.string().describe("Webhook Signing Key - Ethereum"),

    /**
     * AI & FORENSIC TOOLS
     */
    GEMINI_API_KEY: z.string(),
    TAVILY_API_KEY: z.string(),
    TAVILY_SEARCH_URL: z.string().url(),

    /**
     * DATABASE & PERSISTENCE
     */
    NEON_DATABASE_URL: z.string().url(),
    NEON_AGENTS_DATABASE_URL: z.string().url().describe("LangGraph persistence"),

    /**
     * IPFS & STORAGE (PINATA)
     */
    PINATA_API_KEY: z.string(),
    PINATA_API_SECRET: z.string(),
    PINATA_API_JWT: z.string(),

    /**
     * SOCIAL
     */
    TELEGRAM_BOT_TOKEN: z.string(),
    TELEGRAM_CHAT_ID: z.string(),
  },

  clientPrefix: 'NEXT_PUBLIC_',
  client: {

    /**
  * CHAINLINK INFRASTRUCTURE
  */
    NEXT_PUBLIC_ESTIMATED_VRF_GAS_UNITS: z.string().optional(),
    /**
     * ALCHEMY (RPC & WSS)
     */
    NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_RPC_URL: z.string().url(),
    NEXT_PUBLIC_ALCHEMY_ETH_SEPOLIA_RPC_URL: z.string().url(),
    NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_WSS: z.string().url(),
    NEXT_PUBLIC_ALCHEMY_ETH_SEPOLIA_WSS: z.string().url(),

    /**
     * IPFS & STORAGE (PINATA)
     */
    NEXT_PUBLIC_PINATA_IPFS_URL: z.string().url(),
    NEXT_PUBLIC_PINATA_PIN_API_URL: z.string().url(),

    /**
   * MISC
   */
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID: z.string()
  },

  /**
   * Required for Next.js to inline variables at build time.
   */
  runtimeEnv: {
    ...process.env,
    NEXT_PUBLIC_ESTIMATED_VRF_GAS_UNITS: process.env.NEXT_PUBLIC_ESTIMATED_VRF_GAS_UNITS,
    NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_RPC_URL: process.env.NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_RPC_URL,
    NEXT_PUBLIC_ALCHEMY_ETH_SEPOLIA_RPC_URL: process.env.NEXT_PUBLIC_ALCHEMY_ETH_SEPOLIA_RPC_URL,
    NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_WSS: process.env.NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_WSS,
    NEXT_PUBLIC_ALCHEMY_ETH_SEPOLIA_WSS: process.env.NEXT_PUBLIC_ALCHEMY_ETH_SEPOLIA_WSS,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    NEXT_PUBLIC_PINATA_IPFS_URL: process.env.NEXT_PUBLIC_PINATA_IPFS_URL,
    NEXT_PUBLIC_PINATA_PIN_API_URL: process.env.NEXT_PUBLIC_PINATA_PIN_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID: process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID,
  },
  emptyStringAsUndefined: true,
  onValidationError: (errors) => {
    console.error("❌ Invalid environment variables:")

    errors.forEach((err) => {
      // Use a fallback if path is undefined or empty
      const path = err.path?.join(".") || "Unknown variable"
      console.error(`   - ${path}: ${err.message}`)
    })

    // Kill the process only on server to prevent crashing client hydration
    if (typeof window === "undefined") {
      process.exit(1)
    }

    throw new Error("Invalid environment variables")
  },
})