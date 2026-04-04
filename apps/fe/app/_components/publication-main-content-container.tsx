"use client"

import type { Publication } from "@packages/schema"
import type { FC, PropsWithChildren } from "react"
import { usePublicationDetailContext } from "@/_hooks/context/use-publication-details-ctx"
import { PublicationMainContent } from "./publication-main-content"

export const PublicationMainContentContainer: FC<PropsWithChildren> = (
	props,
) => {
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
