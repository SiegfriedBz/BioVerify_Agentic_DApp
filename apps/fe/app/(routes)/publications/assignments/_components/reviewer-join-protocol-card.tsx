import { NetworkBadge } from "@/app/_components/network-badge"
import { SwitchChainButton } from "@/app/_components/switch-chain-button"
import { TypographyH3, TypographySmall } from "@/app/_components/typography"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { NetworkT } from "@packages/schema"
import { Shield } from "lucide-react"
import type { FC } from "react"
import { PayReviewerStakeButton } from "./pay-reviewer-stake-button"

type Props = {
	currentNetwork: NetworkT
}

export const ReviewerJoinProtocolCard: FC<Props> = (props) => {
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
							className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-[0_0_28px_rgba(0,209,255,0.14)]"
						>
							<Shield className="size-7" strokeWidth={1.5} />
						</div>
						<div className="min-w-0 space-y-3 text-left">
							<TypographyH3 className="mt-0! border-0 pb-0 text-xl font-bold tracking-tight @md:text-2xl">
								Join the Protocol
							</TypographyH3>
							<div className="flex flex-col gap-2 @sm:flex-row @sm:items-center @sm:gap-3">
								<TypographySmall className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
									Staking on
								</TypographySmall>
								<NetworkBadge network={currentNetwork} />
							</div>
							<p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
								Stake ETH on this network to register as a reviewer and earn
								rewards.
							</p>
							<p className="max-w-lg text-sm leading-relaxed text-muted-foreground/80">
								Switch networks in your wallet if you intend to stake on the
								other available network.
							</p>
						</div>
					</div>
					<div className="flex flex-col justify-center gap-3 @xl:border-border/30 @xl:border-l @xl:pl-10">
						<PayReviewerStakeButton
							size="lg"
							className="h-12 w-full font-bold uppercase tracking-tight @xl:min-w-56 @xl:w-auto border-0 bg-[linear-gradient(135deg,#a4e6ff_0%,#00d1ff_100%)] text-[#003543] shadow-[0_4px_20px_rgba(0,209,255,0.18)] transition-[filter,box-shadow] hover:bg-[linear-gradient(135deg,#a4e6ff_0%,#00d1ff_100%)] hover:text-[#003543] hover:brightness-110 hover:shadow-[0_6px_24px_rgba(0,209,255,0.22)]"
						>
							Register as Reviewer
						</PayReviewerStakeButton>
						<SwitchChainButton
							variant="outline"
							size="lg"
							className="h-12 w-full @xl:w-auto"
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
