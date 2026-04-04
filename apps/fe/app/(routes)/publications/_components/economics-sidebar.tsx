"use client"

import type { Protocol, Publication } from "@packages/schema"
import { LandmarkIcon, UsersIcon } from "lucide-react"
import type { FC } from "react"
import { TypographyH4, TypographySmall } from "@/app/_components/typography"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

import { ParticipantsContent } from "./participants-content"

type Props = {
	publication: Publication
	protocol: Protocol
}

export const EconomicsSidebar: FC<Props> = (props) => {
	const { publication, protocol } = props

	return (
		<div className="flex flex-col gap-6">
			{/* Stake Distribution - Calculated from Protocol Constants */}
			<Card className="bg-card/50 border-border">
				<CardHeader className="pb-2">
					<div className="flex items-center gap-2">
						<LandmarkIcon className="h-4 w-4 text-primary" />
						<TypographyH4 className="text-sm uppercase tracking-wider text-foreground">
							Economic Weight
						</TypographyH4>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex justify-between items-end border-b border-border/50 pb-3">
						<TypographySmall className="text-muted-foreground">
							Total Locked Stake
						</TypographySmall>
						<div className="text-right">
							<span className="font-mono font-bold text-lg text-primary">
								{publication.lockedStake}
							</span>
							<TypographySmall className="ml-1 text-[10px] text-muted-foreground">
								ETH
							</TypographySmall>
						</div>
					</div>
					<div className="flex justify-between items-center opacity-70">
						<TypographySmall className="text-[10px] uppercase">
							Base Publisher Stake
						</TypographySmall>
						<TypographySmall className="font-mono">
							{protocol?.publisherStake ?? "..."} ETH
						</TypographySmall>
					</div>
					<div className="flex justify-between items-center">
						<TypographySmall className="text-muted-foreground">
							Submission Fee
						</TypographySmall>
						<div className="text-right">
							<span className="font-mono font-medium text-sm">
								{publication.paidSubmissionFee}
							</span>
							<TypographySmall className="ml-1 text-[10px] text-muted-foreground">
								ETH
							</TypographySmall>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Participants - Suspended for Data Fetching */}
			<Card className="bg-card/50 border-border">
				<CardHeader className="pb-2">
					<div className="flex items-center gap-2">
						<UsersIcon className="h-4 w-4 text-primary" />
						<TypographyH4 className="text-sm uppercase tracking-wider text-foreground">
							Validation Team
						</TypographyH4>
					</div>
				</CardHeader>
				<ParticipantsContent publication={publication} />
			</Card>
		</div>
	)
}
