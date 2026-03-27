"use client"

import { PublicationDetailContext } from "@/_hooks/context/use-publication-details-ctx"
import { usePublicationDetail } from "@/_hooks/cqrs/queries/use-publication-detail"
import { PublicationDetailSkeleton } from "@/app/(routes)/publications/_components/publication-detail-skeleton"
import { FetchError } from "@/app/_components/fetch-error"
import { Publication } from "@packages/schema"
import { FC, PropsWithChildren, useMemo } from "react"

type Props = {
  initialPublication: Publication
}

export const PublicationDetailsProvider: FC<PropsWithChildren<Props>> = props => {
  const { initialPublication, children } = props

  // Use smart polling hook
  const { data: livePublication, isFetching, isError, refetch } = usePublicationDetail({
    initialData: initialPublication,
    id: initialPublication.id
  })

  const value = useMemo(() => {
    return { publication: livePublication, isSyncing: isFetching }
  }, [livePublication, isFetching])

  if (isError) return <FetchError refetch={refetch} />

  if (isFetching && !livePublication) return <PublicationDetailSkeleton />

  if (!livePublication) return null

  return (
    <PublicationDetailContext.Provider value={value}>
      {children}
    </PublicationDetailContext.Provider>
  )
}
