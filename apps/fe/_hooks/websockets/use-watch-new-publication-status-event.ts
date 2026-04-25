"use client"

/**
 * @title Real-Time Publication Status Watcher
 * @notice Subscribes to on-chain `NewPublicationStatus` events via WebSocket
 * (eth_subscribe) on all supported chains, then invalidates the TanStack Query
 * publications cache so the UI refreshes automatically.
 *
 * @dev Uses standalone viem WebSocket clients (not wagmi) so that subscriptions
 * remain active regardless of the user's wallet connection state. This is
 * critical for the "spectator" use-case where User B sees real-time updates
 * triggered by User A's submission without needing a connected wallet.
 *
 * Clients are created inside useEffect to guarantee browser-only execution
 * (WebSocket is not available during SSR) and cached in a ref for the
 * lifetime of the component.
 *
 * Rapid-fire events are coalesced via a trailing debounce to avoid redundant
 * refetches when multiple status transitions arrive in quick succession
 * (e.g. Submitted → InReview within the same block).
 */

import {
	createBaseSepoliaWsClient,
	createEthSepoliaWsClient,
} from "@/_config/viem/ws-clients"
import { NetworkSchema } from "@packages/schema"
import { BioVerifyContractConfig } from "@packages/utils"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useRef } from "react"
import type { Log, WatchContractEventReturnType } from "viem"
import { publicationsKeys } from "../cqrs/query-keys/publications-keys"

type NewPublicationStatusArgs = {
	pubId?: bigint
	newStatus?: number
}

/** Trailing debounce window for coalescing rapid-fire events. */
const INVALIDATION_DELAY_MS = 3_000

const baseSepoliaConfig =
	BioVerifyContractConfig[NetworkSchema.enum.base_sepolia]
const ethSepoliaConfig = BioVerifyContractConfig[NetworkSchema.enum.eth_sepolia]

export const useWatchNewPublicationStatusEvent = () => {
	const queryClient = useQueryClient()

	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

	const handleLogs = useCallback(
		(logs: Log[]) => {
			if (logs.length === 0) return

			const typedLogs = logs as (Log & {
				args?: NewPublicationStatusArgs
			})[]
			const pubIds = typedLogs
				.map((log) => log.args?.pubId?.toString())
				.filter(Boolean)

			if (pubIds.length === 0) return

			if (process.env.NODE_ENV === "development") {
				console.log(
					`[WS] NewPublicationStatus events for pubIds: ${pubIds.join(", ")}`,
				)
			}

			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current)
			}

			debounceTimerRef.current = setTimeout(() => {
				debounceTimerRef.current = null

				queryClient.invalidateQueries({
					queryKey: publicationsKeys.all,
				})

				if (process.env.NODE_ENV === "development") {
					console.log(`[WS] Cache invalidated for pubIds: ${pubIds.join(", ")}`)
				}
			}, INVALIDATION_DELAY_MS)
		},
		[queryClient],
	)

	useEffect(() => {
		const baseSepoliaWsClient = createBaseSepoliaWsClient()
		const ethSepoliaWsClient = createEthSepoliaWsClient()

		const unwatchFns: WatchContractEventReturnType[] = []

		unwatchFns.push(
			baseSepoliaWsClient.watchContractEvent({
				address: baseSepoliaConfig.address,
				abi: baseSepoliaConfig.abi,
				eventName: "NewPublicationStatus",
				onLogs: handleLogs,
			}),
		)

		unwatchFns.push(
			ethSepoliaWsClient.watchContractEvent({
				address: ethSepoliaConfig.address,
				abi: ethSepoliaConfig.abi,
				eventName: "NewPublicationStatus",
				onLogs: handleLogs,
			}),
		)

		return () => {
			for (const unwatch of unwatchFns) {
				unwatch()
			}
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current)
			}
		}
	}, [handleLogs])
}
