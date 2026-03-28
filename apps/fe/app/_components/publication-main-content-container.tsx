"use client"

import { usePublicationDetailContext } from "@/_hooks/context/use-publication-details-ctx"
import { Publication } from "@packages/schema"
import { FC, PropsWithChildren } from "react"
import { PublicationMainContent } from "./publication-main-content"

export const PublicationMainContentContainer: FC<PropsWithChildren> = (props) => {
  const { children } = props

  // Use smart polling hook
  const { publication, isSyncing } = usePublicationDetailContext()

  return (
    <PublicationMainContent
      publication={publication as Publication}
      isSyncing={isSyncing}
    >
      {children}
    </PublicationMainContent>
  )
}