"use client"

import { usePublicationDetailContext } from "@/_hooks/context/use-publication-details-ctx"
import type { FC, PropsWithChildren } from "react"
import { VerdictCardContent } from "./verdict-card-content"

type Props = {
	initialVerdictCid?: string
}

export const VerdictCardContainer: FC<PropsWithChildren<Props>> = (props) => {
	const { initialVerdictCid, children } = props
	const { publication } = usePublicationDetailContext()

	const verdictCid = publication?.verdictCid

	if (initialVerdictCid && verdictCid === initialVerdictCid) {
		return <>{children}</>
	}

	if (!verdictCid) return null

	return <VerdictCardContent verdictCid={verdictCid} />
}
