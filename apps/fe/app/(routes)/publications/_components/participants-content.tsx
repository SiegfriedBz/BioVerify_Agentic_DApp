"use client"

import type { Publication } from "@packages/schema"
import { ShieldCheckIcon } from "lucide-react"
import { type FC, useMemo } from "react"
import { useMembersByIds } from "@/_hooks/cqrs/queries/use-members-by-ids"
import { AddressDisplay } from "@/app/_components/address-display"
import { FetchError } from "@/app/_components/fetch-error"
import { TypographyP, TypographySmall } from "@/app/_components/typography"
import { CardContent } from "@/components/ui/card"

type Props = { publication: Publication }

export const ParticipantsContent: FC<Props> = ({ publication }) => {
	const reviewerIds = useMemo(() => {
		const ids = publication.reviewers.map(
			(addr) => `${publication.chainId}-${addr}`,
		)
		if (publication.seniorReviewer) {
			ids.push(`${publication.chainId}-${publication.seniorReviewer}`)
		}

		return ids
	}, [publication.reviewers, publication.seniorReviewer, publication.chainId])

	const {
		data: members,
		isFetching,
		isError,
		refetch,
	} = useMembersByIds({
		ids: reviewerIds,
		publicationStatus: publication.status,
	})

	if (isError) return <FetchError refetch={refetch} />

	if (isFetching && reviewerIds.length > 0) {
		return (
			<div className="p-6 text-center animate-pulse text-[10px] text-muted-foreground uppercase">
				Syncing Profiles...
			</div>
		)
	}

	return (
		<CardContent className="space-y-6 pt-2">
			{/* Senior Reviewer Section */}
			<div className="space-y-3">
				<div className="flex items-center gap-2">
					<ShieldCheckIcon className="h-3 w-3 text-primary" />
					<TypographySmall className="text-[10px] font-bold text-primary uppercase tracking-tighter">
						Senior Reviewer
					</TypographySmall>
				</div>

				{publication.seniorReviewer ? (
					<div className="flex justify-between items-center bg-primary/5 p-2 rounded-lg border border-primary/20">
						<AddressDisplay address={publication.seniorReviewer} />
						<div className="text-right">
							<TypographySmall className="block font-mono text-[10px] text-primary font-bold">
								{members?.find((m) => m.address === publication.seniorReviewer)
									?.reputation ?? "0"}{" "}
								REP
							</TypographySmall>
						</div>
					</div>
				) : (
					<TypographyP className="text-xs italic text-muted-foreground pl-1">
						Awaiting VRF fulfillment...
					</TypographyP>
				)}
			</div>

			{/* Peer Reviewers Section */}
			<div className="space-y-3">
				<TypographySmall className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter pl-1">
					Peer Review Pool
				</TypographySmall>
				<div className="flex flex-col gap-2">
					{publication.reviewers.length > 0 ? (
						publication.reviewers.map((rev) => {
							const m = members?.find((mem) => mem.address === rev)
							return (
								<div
									key={rev}
									className="flex justify-between items-center bg-muted/20 p-2 rounded-lg border border-border/30"
								>
									<AddressDisplay address={rev} className="h-auto" />
									<TypographySmall className="font-mono text-[10px] text-muted-foreground">
										{m ? `${m.reputation} REP` : "0 REP"}
									</TypographySmall>
								</div>
							)
						})
					) : (
						<TypographyP className="text-xs italic text-muted-foreground pl-1">
							Awaiting VRF fulfillment...
						</TypographyP>
					)}
				</div>
			</div>
		</CardContent>
	)
}
