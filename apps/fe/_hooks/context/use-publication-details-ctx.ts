"use client"

import { Publication } from "@packages/schema"
import { createContext, useContext } from "react"

export type PublicationDetailContextT = {
  publication: Publication | null
  isSyncing: boolean
}

export const PublicationDetailContext = createContext<PublicationDetailContextT>({
  publication: null,
  isSyncing: true
})

export const usePublicationDetailContext = () => {
  const ctx = useContext(PublicationDetailContext)
  if (!ctx) {
    throw new Error("usePublicationDetailContext must be used within its PublicationDetailProvider")
  }
  return ctx
}