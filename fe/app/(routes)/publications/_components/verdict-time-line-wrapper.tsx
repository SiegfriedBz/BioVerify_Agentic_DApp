"use client"

import { usePublicationLiveStatus } from "@/app/_hooks/events/use-publication-live-status"
import { ProtocolPublicationStatus } from "@/app/_schemas/schemas/contract/protocol-publication"
import { FC } from "react"
import { VerdictTimeline } from "./verdict-timeline"

type Props = {
  publicationId: number
  currentStatus: ProtocolPublicationStatus
  hasReviewers: boolean
}

export const VerdictTimeLineWrapper: FC<Props> = (props) => {
  const { publicationId, currentStatus,
    hasReviewers } = props

  const { syncedStatus, syncedHasReviewers } = usePublicationLiveStatus({
    initialStatus: currentStatus,
    initialHasReviewers: hasReviewers,
    publicationId: BigInt(publicationId)
  })

  return (
    <VerdictTimeline
      currentStatus={syncedStatus}
      hasReviewers={syncedHasReviewers}
    />
  )
}