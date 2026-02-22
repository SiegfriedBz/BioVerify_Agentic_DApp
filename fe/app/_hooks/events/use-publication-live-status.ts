"use client"

import { ProtocolPublicationStatus, ProtocolPublicationStatusSchema } from "@/app/_schemas/schemas/contract/protocol-publication"
import { useState } from "react"
import { useWatchContractEvent } from "wagmi"
import { useContractConfig } from "../use-contract-config"

type Params = {
  initialStatus: ProtocolPublicationStatus
  initialHasReviewers: boolean
  publicationId: bigint
}

type BioVerifyLog = { args: { pubId: bigint } }

/**
 * Custom hook to synchronize contract events with the VerdictTimeline UI.
 * Provides real-time status updates via WSS without requiring page refreshes.
 */
export const usePublicationLiveStatus = (params: Params) => {
  const { initialStatus, initialHasReviewers, publicationId: pubId } = params

  const [syncedStatus, setSyncedStatus] = useState<ProtocolPublicationStatus>(() => initialStatus)
  const [syncedHasReviewers, setSyncedHasReviewers] = useState<boolean>(() => initialHasReviewers)

  const contractConfig = useContractConfig()

  // 1. Agent Plagiarism Check: FAILED (Early Slash)
  useWatchContractEvent({
    ...contractConfig,
    eventName: 'BioVerify_Agent_SlashPublisher',
    onLogs(logs) {
      const typedLogs = logs as unknown as BioVerifyLog[]
      if (typedLogs.some(l => l.args.pubId === pubId)) {
        setSyncedStatus(ProtocolPublicationStatusSchema.enum.SLASHED)
        setSyncedHasReviewers(false) // Ensures UI knows AI Shield failed before reviewers
      }
    }
  })

  // 2. Agent Plagiarism Check: PASSED (VRF Triggered)
  useWatchContractEvent({
    ...contractConfig,
    eventName: 'BioVerify_Agent_RequestVRF',
    onLogs(logs) {
      const typedLogs = logs as unknown as BioVerifyLog[]
      if (typedLogs.some(l => l.args.pubId === pubId)) {
        setSyncedStatus(ProtocolPublicationStatusSchema.enum.IN_REVIEW)
      }
    }
  })

  // 3. VRF Fulfilled: Reviewers Assigned
  useWatchContractEvent({
    ...contractConfig,
    eventName: 'BioVerify_Agent_PickReviewers',
    onLogs(logs) {
      const typedLogs = logs as unknown as BioVerifyLog[]
      if (typedLogs.some(l => l.args.pubId === pubId)) {
        setSyncedHasReviewers(true)
        setSyncedStatus(ProtocolPublicationStatusSchema.enum.IN_REVIEW)
      }
    }
  })

  // 4. Peer Review: PASSED (Published)
  useWatchContractEvent({
    ...contractConfig,
    eventName: 'BioVerify_Agent_PublishPublication',
    onLogs(logs) {
      const typedLogs = logs as unknown as BioVerifyLog[]
      if (typedLogs.some(l => l.args.pubId === pubId)) {
        setSyncedStatus(ProtocolPublicationStatusSchema.enum.PUBLISHED)
      }
    }
  })

  // 5. Peer Review: FAILED (Late Slash)
  useWatchContractEvent({
    ...contractConfig,
    eventName: 'BioVerify_Agent_SlashPublication',
    onLogs(logs) {
      const typedLogs = logs as unknown as BioVerifyLog[]
      if (typedLogs.some(l => l.args.pubId === pubId)) {
        setSyncedStatus(ProtocolPublicationStatusSchema.enum.SLASHED)
        // syncedHasReviewers should already be true here, which triggers the UI correctly
      }
    }
  })

  return { syncedStatus, syncedHasReviewers }
}