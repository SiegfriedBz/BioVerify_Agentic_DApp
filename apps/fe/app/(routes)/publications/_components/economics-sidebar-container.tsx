"use client"

import type { Protocol } from "@packages/schema"
import type { FC } from "react"
import { usePublicationDetailContext } from "@/_hooks/context/use-publication-details-ctx"
import { EconomicsSidebar } from "./economics-sidebar"

type Props = {
	protocol: Protocol // protocol constants
}

export const EconomicsSidebarContainer: FC<Props> = (props) => {
	const { protocol } = props

	// Use smart polling hook
	const { publication } = usePublicationDetailContext()

	if (!publication) return null

	return <EconomicsSidebar publication={publication} protocol={protocol} />
}
