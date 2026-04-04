import { ChainIdToNetwork } from "@packages/utils"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { NetworkBadge } from "@/app/_components/network-badge"
import { TypographyH2, TypographyP } from "@/app/_components/typography"
import { ExecuteReviewWrapperSkeleton } from "./_components/execute-review-wrapper-skeleton"
import { ReviewerGuardWrapper } from "./_components/reviewer-guard-wrapper"

type Props = {
	params: Promise<{ id: string }> // chainId-pubId
}

export default async function Page(props: Props) {
	const { params } = props
	const { id } = await params
	const [chainId, pubId] = id.split("-")

	if (!chainId || !pubId) {
		return notFound()
	}

	return (
		<div className="space-y-8 max-w-7xl mx-auto">
			<div className="flex flex-col gap-1 border-b border-border pb-6">
				<TypographyH2 className="text-3xl font-bold tracking-tight">
					Review Assignment on Publication #{pubId} - Published on{" "}
					<NetworkBadge
						network={ChainIdToNetwork[Number.parseInt(chainId, 10)]}
					/>
				</TypographyH2>
				<TypographyP className="text-muted-foreground mt-0!">
					Evaluate the technical merit and data integrity of the submitted
					research manifest.
				</TypographyP>
			</div>

			<Suspense fallback={<ExecuteReviewWrapperSkeleton />}>
				<ReviewerGuardWrapper id={id} />
			</Suspense>
		</div>
	)
}
