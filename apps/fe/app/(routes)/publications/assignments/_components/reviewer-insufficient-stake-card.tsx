import type { NetworkT } from "@packages/schema"
import { AlertTriangle } from "lucide-react"
import type { FC } from "react"
import { NetworkBadge } from "@/app/_components/network-badge"
import { TypographyH3, TypographySmall } from "@/app/_components/typography"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { PayReviewerStakeButton } from "./pay-reviewer-stake-button"

type Props = {
	currentNetwork: NetworkT
}

export const ReviewerInsufficientStakeCard: FC<Props> = (props) => {
	const { currentNetwork } = props

	return (
		<Card
			className={cn(
				"border-border/40 bg-card/70 py-0 shadow-[0_20px_40px_rgba(14,20,27,0.4)] backdrop-blur-sm",
			)}
		>
			<CardContent className="p-0">
				<div className="grid gap-8 p-6 @md:p-8 @xl:grid-cols-[1fr_auto] @xl:items-center @xl:gap-10">
					<div className="flex flex-col gap-5 @sm:flex-row @sm:items-start @sm:gap-6">
						<div
							aria-hidden
							className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-error/15 text-error ring-1 ring-error/25 shadow-[0_0_24px_rgba(192,38,45,0.12)]"
						>
							<AlertTriangle className="size-7" strokeWidth={1.5} />
						</div>
						<div className="min-w-0 space-y-3 text-left">
							<TypographyH3 className="mt-0! border-0 pb-0 text-xl font-bold tracking-tight text-error @md:text-2xl">
								Stake below minimum
							</TypographyH3>
							<div className="flex flex-col gap-2 @sm:flex-row @sm:items-center @sm:gap-3">
								<TypographySmall className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
									Network
								</TypographySmall>
								<NetworkBadge network={currentNetwork} />
							</div>
							<p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
								Your available stake on this network is below the protocol
								minimum. Top up to accept <strong>future</strong> assignments,
								or switch networks if you stake elsewhere.
							</p>
						</div>
					</div>
					<div className="flex flex-col justify-center @xl:border-border/30 @xl:border-l @xl:pl-10">
						<PayReviewerStakeButton
							size="sm"
							className="cursor-pointer bg-primary font-semibold tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
						>
							Top up stake
						</PayReviewerStakeButton>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
