import { TypographyH2, TypographyP } from "@/app/_components/typography"
import { PeerReviewContainer } from "./_components/peer-review-container"

export default function Page() {
	return (
		<div className="space-y-8 max-w-7xl">
			<div className="flex flex-col gap-1 border-b border-border pb-6">
				<TypographyH2 className="text-3xl font-bold tracking-tight">
					Peer Review Portal
				</TypographyH2>
				<TypographyP className="text-muted-foreground mt-0!">
					Stake your reputation to validate the next generation of scientific breakthroughs.
				</TypographyP>
			</div>

			<PeerReviewContainer />
		</div>
	)
}