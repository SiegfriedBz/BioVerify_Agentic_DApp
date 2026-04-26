"use client"

import { useWatchNewPublicationStatusEvent } from "@/_hooks/websockets/use-watch-new-publication-status-event"
import type { FC, PropsWithChildren } from "react"

export const PublicationsRealtimeProvider: FC<PropsWithChildren> = ({
	children,
}) => {
	useWatchNewPublicationStatusEvent()

	return <>{children}</>
}
