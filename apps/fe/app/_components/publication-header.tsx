import type { Publication } from "@packages/schema"
import { ChainIdToNetwork } from "@packages/utils"
import { CalendarIcon } from "lucide-react"
import type { FC } from "react"
import { AddressDisplay } from "./address-display"
import { NetworkBadge } from "./network-badge"
import { PublicationStatusBadge } from "./publication-status-badge"
import { ShareReportButton } from "./share-report-button"
import { SyncIndicator } from "./sync-indicator"
import { TypographyH2, TypographySmall } from "./typography"

type Props = {
	publication: Publication
	isSyncing: boolean
}

export const PublicationHeader: FC<Props> = (props) => {
	const {
		publication: { id, pubId, chainId, publisher, status, createdAt },
		isSyncing,
	} = props

	return (
		<div className="flex flex-col gap-6 border-b border-border pb-8 relative">
			{isSyncing && <SyncIndicator />}

			{/* Top Row: Navigation Context & Actions */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<TypographySmall className="text-muted-foreground uppercase font-bold tracking-widest text-[10px]">
						Ledger Entry
					</TypographySmall>

					{chainId && <NetworkBadge network={ChainIdToNetwork[chainId]} />}

					<div className="h-1 w-1 rounded-full bg-border" />
					<TypographySmall className="font-mono text-primary font-bold">
						#{pubId}
					</TypographySmall>
				</div>

				<ShareReportButton id={id} />
			</div>

			{/* Middle Row: Primary Title & Status */}
			<div className="flex flex-col @3xl:flex-row @3xl:items-center justify-between gap-4">
				<div className="space-y-1">
					<TypographyH2 className="font-bold tracking-tight">
						Publication Analysis
					</TypographyH2>
					<div className="flex items-center gap-3">
						<TypographySmall className="text-muted-foreground flex items-center gap-1.5">
							<CalendarIcon className="h-3 w-3" />
							Indexed on{" "}
							{new Date(createdAt).toLocaleDateString("en-US", {
								dateStyle: "medium",
							})}
						</TypographySmall>
						<div className="h-3 w-px bg-border" />

						{publisher && (
							<div className="flex items-center gap-2">
								<TypographySmall className="text-muted-foreground">
									Author:
								</TypographySmall>
								<AddressDisplay address={publisher} />
							</div>
						)}
					</div>
				</div>

				<div className="flex items-center gap-3 bg-muted/30 p-3 rounded-xl border border-border/50 self-start @3xl:self-center">
					<TypographySmall className="font-bold text-[10px] uppercase tracking-tighter text-muted-foreground/70">
						Current Status
					</TypographySmall>
					<PublicationStatusBadge status={status} />
				</div>
			</div>
		</div>
	)
}
