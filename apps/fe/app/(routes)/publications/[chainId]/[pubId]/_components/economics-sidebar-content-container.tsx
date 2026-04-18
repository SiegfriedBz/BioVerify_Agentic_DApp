"use client"

import type { Protocol } from "@packages/schema"
import type { FC } from "react"
import { usePublicationDetailContext } from "@/_hooks/context/use-publication-details-ctx"
import { EconomicsSidebarContent } from "./economics-sidebar-content"

type Props = {
	protocol: Protocol // protocol constants
}

export const EconomicsSidebarContentContainer: FC<Props> = (props) => {
	const { protocol } = props

	// Use smart polling hook
	const { publication } = usePublicationDetailContext()

	if (!publication) return null

	return (
		<EconomicsSidebarContent publication={publication} protocol={protocol} />
	)
}
