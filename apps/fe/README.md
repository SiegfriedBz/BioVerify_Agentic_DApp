# 🧬 BioVerify Frontend

Next.js 16 App Router DApp for decentralized scientific peer review. Scientists submit publications on-chain, AI agents validate originality, Chainlink VRF selects peer reviewers, and human verdicts settle stakes -- all orchestrated through this interface.

This is the user-facing application within the [BioVerify monorepo](../../README.md). It connects the on-chain protocol ([`apps/contracts`](../contracts/README.md)) to the off-chain AI agents ([Submission](../../packages/agents/graphs/submission/README.md), [Review](../../packages/agents/graphs/review/README.md)) through a CQRS event-projection layer ([`@packages/cqrs`](../../packages/cqrs/README.md)).

## Tech Stack

| Category | Technologies |
|----------|-------------|
| Framework | Next.js 16 (App Router, RSC, Server Actions), React 19, TypeScript |
| Web3 | wagmi v3, viem, Reown AppKit (WalletConnect), EIP-712 typed data signing |
| Storage | IPFS (Pinata) for publication manifests and verdict pinning |
| Data | TanStack Query v5, `@packages/cqrs` (server-side queries via `"use server"` bridge), Drizzle ORM |
| Tables | TanStack Table v8 + custom `niko-table` component library, nuqs (URL state sync) |
| Forms | react-hook-form + zod validation |
| UI | Tailwind CSS v4, shadcn/ui, Lucide icons, next-themes, sonner -- fully responsive |
| Infra | Inngest (durable agent execution), Alchemy Notify (webhooks), Vercel Functions (`waitUntil`) |

## Monorepo Context

```mermaid
graph TD
    FE["apps/fe (this app)"]
    Chain["EVM Chains (Base Sepolia, Eth Sepolia)"]
    Alchemy["Alchemy Notify"]
    CQRS["@packages/cqrs"]
    NeonDB["Neon Postgres"]
    Inngest["Inngest"]
    Agents["@packages/agents (LangGraph)"]
    IPFS["IPFS (Pinata)"]

    FE -- "wagmi writeContract" --> Chain
    Chain -- "emits events" --> Alchemy
    Alchemy -- "POST webhook" --> FE
    FE -- "processContractEvent" --> CQRS
    Chain -- "WSS (NewPublicationStatus)" --> FE
    CQRS -- "upserts / queries" --> NeonDB
    CQRS -- "viem contract calls" --> Chain
    FE -- "serves Inngest functions" --> Inngest
    Inngest -- "step.run" --> Agents
    Agents -- "CQRS commands" --> CQRS
    FE -- "pin manifest" --> IPFS
```

| Package | Role |
|---------|------|
| [`apps/contracts`](../contracts/README.md) | BioVerifyV3 Solidity contract (staking, VRF, settlement), Foundry tests and deployment script |
| [`@packages/cqrs`](../../packages/cqrs/README.md) | Event sync projector, DB queries, on-chain action commands |
| [`@packages/agents`](../../packages/agents/graphs/submission/README.md) | LangGraph AI agents (submission + review) |
| `@packages/schema` | Zod schemas, DB table definitions, domain types, Inngest event types |
| `@packages/db` | Drizzle ORM client (Neon Postgres) |
| `@packages/utils` | Contract config, ABI, network mappings, EIP-712 type definitions |
| `@packages/env` | Type-safe environment variable access |

## Architecture

### React Context Provider Hierarchy

Two provider trees serve different route groups:

- **`RootProviders`** (home): ThemeProvider -> CustomWagmiProvider (Reown AppKit + TanStack QueryClientProvider + NuqsAdapter) -> TooltipProvider
- **`SideProvider`** (publications): Same stack plus `AppSideBarProvider` wrapping a collapsible sidebar layout, and **`PublicationsRealtimeProvider`** (under `app/(routes)/publications/layout.tsx`) which mounts `useWatchNewPublicationStatusEvent` so Alchemy WSS subscriptions stay active on every `/publications/*` route (list, new submission, detail, assignments)

`CustomWagmiProvider` initializes Reown AppKit with `baseSepolia` and `sepolia` networks, configures Alchemy HTTP transports for wallet-connected operations, and hydrates wallet state from cookies for SSR.

### Data Flow

Server Components fetch initial data directly from `@packages/cqrs` (which reads the Neon Postgres projection of on-chain state), then pass it as `initialData` to client-side TanStack Query hooks. This gives instant server-rendered content with seamless client-side reactivity.

```mermaid
sequenceDiagram
    participant RSC as Server Component
    participant CQRS as "@packages/cqrs"
    participant DB as Neon Postgres
    participant Client as Client Hook
    participant TQ as TanStack Query

    RSC->>CQRS: getPublicationById(id)
    CQRS->>DB: Drizzle select
    DB-->>CQRS: row
    CQRS-->>RSC: Publication
    RSC->>Client: initialData={publication}
    Client->>TQ: useQuery({ initialData, refetchInterval })
    TQ-->>Client: live data with smart polling
```

**Smart polling**: Query hooks like `usePublicationDetail` use a dynamic `refetchInterval` that polls every **10 seconds** while a publication is in a pending state, and automatically stops polling once it reaches a terminal status (`PUBLISHED`, `SLASHED`, or `EARLY_SLASHED`). This complements WebSocket-driven status updates: reviewer assignment (`Agent_PickReviewers`) and per-review progress (`Agent_RecordReview`) do not emit `NewPublicationStatus`, so polling still refreshes detail data between status transitions. The `PublicationDetailsProvider` context wraps this pattern, exposing live publication data and a syncing indicator to all child components.

**WebSocket cache invalidation**: `PublicationsRealtimeProvider` calls `useWatchNewPublicationStatusEvent` to subscribe to `NewPublicationStatus` on both chains via standalone viem WebSocket clients (`eth_subscribe` over Alchemy WSS), independent of wagmi's wallet connection state. When events arrive, a debounced invalidation (3-second delay for CQRS eventual consistency) triggers TanStack Query refetches for **`publicationsKeys.all`** (list + detail queries under that prefix) and **`statsKeys.all`** (global stats strip on `/publications`), so the table and metric cards stay in sync without manual refresh. The publications list query also uses `staleTime: 0` so navigating back to `/publications` always background-refetches.

### CQRS Bridge

The `_api/queries/index.ts` file is a `"use server"` re-export of all `@packages/cqrs` query functions. This makes server-only Drizzle queries callable from client-side TanStack Query hooks through Next.js Server Actions, keeping database access strictly server-side while the client gets reactive data.

### Server-Side Filtering and Pagination

The `/publications` table uses **nuqs** as the single source of truth for all table UI state, persisted in URL search params (`pageIndex`, `pageSize`, `sort`, `filters`). Filtering and pagination are server-side -- the server component reads the URL, queries the database, and returns only the matching page.

### Command Hooks

Write operations (`useSubmitPublication`, `usePayReviewerStake`, `useSubmitReview`) each wrap `writeContract` or `signTypedData` from `@wagmi/core` using the shared `reownConfig`. After a successful transaction:

1. **Optimistic cache update** via `queryClient.setQueryData` for instant UI feedback
2. **Delayed invalidation** (3 seconds) via `queryClient.invalidateQueries` to sync with the Neon projection once the Alchemy webhook has processed the on-chain event

### EIP-712 Review Signing

Peer and senior reviewers submit verdicts through an EIP-712 typed data signing flow:

```mermaid
sequenceDiagram
    participant Wallet
    participant Hook as useSubmitReview
    participant SA as Server Action
    participant Agent as Review Agent

    Hook->>Wallet: signTypedData(HumanReview)
    Wallet-->>Hook: signature
    Hook->>SA: sendReviewToAgent(review, signature)
    SA->>SA: verifyRewiewEip712(signature)
    SA->>Agent: Command({ resume: review })
    Note over Agent: HITL interrupt resumes
```

The server action verifies the EIP-712 signature, then resumes the LangGraph review agent's HITL interrupt with the verified review payload.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with protocol mechanism walkthrough and CTAs |
| `/publications` | Server-side paginated and filtered publications table plus global stats cards. nuqs syncs filters (chain, status, page) to URL search params; server component passes them to the CQRS query. TanStack Table in manual mode. Real-time updates: layout-mounted WebSocket on `NewPublicationStatus` invalidates publications + global stats (debounced). |
| `/publications/new` | Submit publication form (react-hook-form + zod, IPFS manifest pinning via Pinata, on-chain `submitPublication`) |
| `/publications/[chainId]/[pubId]` | Publication detail with live smart-polling (10s while non-terminal), verdict timeline, economics sidebar, participants list |
| `/publications/[chainId]/[pubId]/review` | Reviewer form with EIP-712 signing and agent handoff |
| `/publications/assignments` | Reviewer dashboard: stake management, assigned publications table, review status tracking |

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/webhooks/alchemy/all-events` | POST | Alchemy Notify webhook. HMAC-verified per network, decodes contract logs with `viem`, calls `processContractEvent` from `@packages/cqrs` (DB projection + Inngest event triggers). Uses `waitUntil` for non-blocking processing. |
| `/api/inngest` | GET/POST/PUT | Inngest function serving endpoint. Registers three durable functions: `auditPublicationSubmission`, `auditComplete`, `reviewPublication`. |

## Key Patterns

- **Smart polling** -- `refetchInterval` (10s while non-terminal) dynamically stops when a publication reaches a terminal status, covering DB fields not tied to `NewPublicationStatus`
- **WebSocket real-time invalidation** -- `useWatchNewPublicationStatusEvent` (via `PublicationsRealtimeProvider` in the publications layout) subscribes to `NewPublicationStatus` on-chain events via standalone viem WebSocket clients (Alchemy WSS) on both chains, independent of wallet state; rapid-fire events are debounced into TanStack Query invalidations for publications and global stats (3-second delay for CQRS eventual consistency)
- **Optimistic updates + delayed invalidation** -- immediate UI feedback on transactions, with a 3-second delayed cache invalidation to account for Alchemy webhook -> CQRS projection latency
- **Server-first data loading** -- RSC fetches from Neon via `@packages/cqrs`, hydrates client hooks via `initialData` for zero-loading-state initial renders
- **`"use server"` CQRS bridge** -- all Drizzle DB queries stay server-only, exposed to client hooks through Next.js Server Actions
- **Cookie-based SSR wallet state** -- `getAuthFromCookies` extracts the connected address and chain from wagmi's cookie storage, enabling server-side data fetching scoped to the user's wallet and network

## Development

All commands run from the **monorepo root** (not from `apps/fe/`):

```shell
pnpm fe:dev            # start Next.js dev server (with env check)
pnpm fe:build          # production build
pnpm fe:start          # start production server
pnpm lint:check        # Biome lint (apps/fe + packages/)
pnpm lint:format       # Biome format
```
