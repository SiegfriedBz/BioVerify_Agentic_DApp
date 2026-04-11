import { PublicationDetailsProvider } from "@/_context/publication-details-provider"
import { ManifestCardSkeleton } from "@/app/_components/manifest-card-skeleton"
import { ManifestCardWrapper } from "@/app/_components/manifest-card-wrapper"
import { PublicationMainContentContainer } from "@/app/_components/publication-main-content-container"
import { TypographyH4 } from "@/app/_components/typography"
import { VerdictCardSkeleton } from "@/app/_components/verdict-card-skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { getProtocolByChain, getPublicationById } from "@packages/cqrs"
import { LandmarkIcon, MapPinCheckIcon, UsersIcon } from "lucide-react"
import { notFound } from "next/navigation"
import { type FC, Suspense } from "react"
import { EconomicsSidebarContentContainer } from "./economics-sidebar-content-container"
import { ParticipantsSidebarContentContainer } from "./participants-sidebar-content-container"
import { VerdictCardContainer } from "./verdict-card-container"
import { VerdictCardWrapper } from "./verdict-card-wrapper"
import { VerdictTimeLineContainer } from "./verdict-time-line-container"

type Props = { id: string } // "chainId-pubId"

export const PublicationDetailWrapper: FC<Props> = async (props) => {
	const { id } = props

	const publication = await getPublicationById({ id })
	if (!publication) {
		return notFound()
	}

	const protocol = await getProtocolByChain({ chainId: publication.chainId })

	return (
		<PublicationDetailsProvider initialPublication={publication}>
			<div className="flex flex-col gap-8">
				<div className="grid grid-cols-1 @5xl:grid-cols-3 gap-8 items-start max-w-7xl mx-auto">
					{/* Main Research Content Column */}
					<PublicationMainContentContainer>
						<VerdictCardContainer
							initialVerdictCid={publication?.verdictCid ?? undefined}
						>
							{publication?.verdictCid && (
								<Suspense fallback={<VerdictCardSkeleton />}>
									<VerdictCardWrapper verdictCid={publication.verdictCid} />
								</Suspense>
							)}
						</VerdictCardContainer>

						{publication?.cid && (
							<Suspense fallback={<ManifestCardSkeleton />}>
								<ManifestCardWrapper rootCid={publication.cid} />
							</Suspense>
						)}
					</PublicationMainContentContainer>

					{/* Protocol Metrics & Participants Sidebar */}
					<aside className="order-first @5xl:order-last space-y-8 @5xl:sticky @5xl:top-8">
						<section className="space-y-4">
							<Card className="bg-card/50 border-border/40">
								<CardHeader className="pb-2">
									<div className="flex items-center gap-2 text-primary">
										<MapPinCheckIcon className="h-4 w-4" />
										<TypographyH4 className="text-[10px] font-bold uppercase tracking-[0.2em]">
											Validation Trail
										</TypographyH4>
									</div>
								</CardHeader>

								<CardContent className="space-y-6 pt-2">
									<VerdictTimeLineContainer />
								</CardContent>
							</Card>
						</section>

						{protocol && (
							<section className="space-y-4">
								<Card className="bg-card/50 border-border/40">
									<CardHeader className="pb-2">
										<div className="flex items-center gap-2 text-primary">
											<LandmarkIcon className="h-4 w-4 " />
											<TypographyH4 className="text-[10px] font-bold uppercase tracking-[0.2em]">
												Economic Breakdown
											</TypographyH4>
										</div>
									</CardHeader>
									<EconomicsSidebarContentContainer protocol={protocol} />
								</Card>
							</section>
						)}

						<section className="space-y-4">
							<Card className="bg-card/50 border-border/40">
								<CardHeader className="pb-2">
									<div className="flex items-center gap-2 text-primary">
										<UsersIcon className="h-4 w-4" />
										<TypographyH4 className="text-[10px] font-bold uppercase tracking-[0.2em]">
											Validation Team
										</TypographyH4>
									</div>
								</CardHeader>
								<ParticipantsSidebarContentContainer />
							</Card>
						</section>
					</aside>
				</div>
			</div>
		</PublicationDetailsProvider>
	)
}
