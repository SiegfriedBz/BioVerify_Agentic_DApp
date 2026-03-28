"use client"

import { usePublicationDetailContext } from "@/_hooks/context/use-publication-details-ctx"
import { FC } from "react"
import { VerdictTimeline } from "./verdict-timeline"

export const VerdictTimeLineContainer: FC = () => {
  // Use smart polling hook
  const { publication } = usePublicationDetailContext()

  if (!publication) return null

  return (
    <VerdictTimeline
      currentStatus={publication.status}
    />
  )
}