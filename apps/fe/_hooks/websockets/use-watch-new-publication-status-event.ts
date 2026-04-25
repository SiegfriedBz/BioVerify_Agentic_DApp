"use client"

import { NetworkSchema } from "@packages/schema"
import { BioVerifyContractConfig, NetworkToChainId } from "@packages/utils"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useRef } from "react"
import type { Log } from "viem"
import { useWatchContractEvent } from "wagmi"
import { publicationsKeys } from "../cqrs/query-keys/publications-keys"

type NewPublicationStatusArgs = {
  pubId?: bigint
  newStatus?: number
}

const INVALIDATION_DELAY_MS = 3_000

export const useWatchNewPublicationStatusEvent = () => {
  const queryClient = useQueryClient()

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const handleLogs = useCallback(
    (logs: Log[]) => {
      if (logs.length === 0) return

      const typedLogs = logs as (Log & { args?: NewPublicationStatusArgs })[]
      const pubIds = typedLogs
        .map((log) => log.args?.pubId?.toString())
        .filter(Boolean)

      if (pubIds.length === 0) return

      if (process.env.NODE_ENV === "development") {
        console.log(
          `[WS] NewPublicationStatus events for pubIds: ${pubIds.join(", ")}`,
        )
      }

      // Coalesce rapid-fire events into a single trailing invalidation
      // to avoid redundant refetches when multiple status changes arrive together
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null

        queryClient.invalidateQueries({
          queryKey: publicationsKeys.all,
        })

        if (process.env.NODE_ENV === "development") {
          console.log(
            `[WS] Cache invalidated for pubIds: ${pubIds.join(", ")}`,
          )
        }
      }, INVALIDATION_DELAY_MS)
    },
    [queryClient],
  )

  useWatchContractEvent({
    ...BioVerifyContractConfig[NetworkSchema.enum.base_sepolia],
    chainId: NetworkToChainId[NetworkSchema.enum.base_sepolia],
    eventName: "NewPublicationStatus",
    onLogs: handleLogs,
  })

  useWatchContractEvent({
    ...BioVerifyContractConfig[NetworkSchema.enum.eth_sepolia],
    chainId: NetworkToChainId[NetworkSchema.enum.eth_sepolia],
    eventName: "NewPublicationStatus",
    onLogs: handleLogs,
  })
}
