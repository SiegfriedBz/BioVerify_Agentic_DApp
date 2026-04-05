"use client"

import type { FC } from "react"
import { usePublicationDetailContext } from "@/_hooks/context/use-publication-details-ctx"
import { ParticipantsContent } from "./participants-content"

export const ParticipantsSidebarContentContainer: FC = () => {
	// Use smart polling hook
	const { publication } = usePublicationDetailContext()

	if (!publication) return null

	return <ParticipantsContent publication={publication} />
}
