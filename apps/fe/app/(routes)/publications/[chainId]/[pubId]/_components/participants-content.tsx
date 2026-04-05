"use client"

import { useMembersByIds } from "@/_hooks/cqrs/queries/use-members-by-ids"
import { AddressDisplay } from "@/app/_components/address-display"
import { FetchError } from "@/app/_components/fetch-error"
import { TypographySmall } from "@/app/_components/typography"
import { CardContent } from "@/components/ui/card"
import { type Publication, PublicationStatusSchema } from "@packages/schema"
import { CircleOffIcon, DicesIcon, ShieldCheckIcon } from "lucide-react"
import { type FC, useMemo } from "react"

type Props = { publication: Publication }

export const ParticipantsContent: FC<Props> = (props: Props) => {
	const { publication } = props

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
				Syncing Participants...
			</div>
		)
	}

	if (publication.status === PublicationStatusSchema.enum.EARLY_SLASHED) {
		return (
			<CardContent className="pt-2 flex items-center gap-x-2">
				<CircleOffIcon
					className="h-3.5 w-3.5 shrink-0 text-(--error)/60"
					aria-hidden
				/>
				<TypographySmall className="text-muted-foreground text-xs font-medium leading-snug">
					Terminated by AI Shield
				</TypographySmall>
			</CardContent>
		)
	}

	return (
		<CardContent className="space-y-6 pt-2">
			{/* Senior Reviewer Section */}
			<div className="space-y-3">
				<div className="flex items-center gap-2">
					<ShieldCheckIcon className="h-3 w-3" />
					<TypographySmall className="text-[10px] font-bold uppercase tracking-[0.15em]">
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
					<div className="flex flex-row items-center gap-2">
						<DicesIcon
							className="h-3.5 w-3.5 shrink-0 text-primary/80 animate-pulse"
							aria-hidden
						/>
						<TypographySmall className="text-muted-foreground text-xs font-medium leading-snug">
							Awaiting VRF Selection...
						</TypographySmall>
					</div>
				)}
			</div>

			{/* Peer Reviewers Section */}
			<div className="space-y-3">
				<TypographySmall className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] pl-1">
					Peer Reviews
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
						<div className="flex flex-row items-center gap-2">
							<DicesIcon
								className="h-3.5 w-3.5 shrink-0 text-primary/80 animate-pulse"
								aria-hidden
							/>
							<TypographySmall className="text-muted-foreground text-xs font-medium leading-snug">
								Awaiting VRF Selection...
							</TypographySmall>
						</div>
					)}
				</div>
			</div>
		</CardContent>
	)
}
