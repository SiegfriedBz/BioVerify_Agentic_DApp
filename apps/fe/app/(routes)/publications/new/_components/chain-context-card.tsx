"use client"

import type { NetworkT } from "@packages/schema"
import type { FC } from "react"
import { NetworkBadge, NetworkToMessage } from "@/app/_components/network-badge"
import { TypographySmall } from "@/app/_components/typography"
import { Button } from "@/components/ui/button"

type Props = {
	targetNetwork: NetworkT
	connectedNetwork: NetworkT | "unknown"
	onSwitchChain: () => void
}

export const ChainContextCard: FC<Props> = (props) => {
	const { targetNetwork, connectedNetwork, onSwitchChain } = props

	const isWrongNetwork =
		connectedNetwork === "unknown" || connectedNetwork !== targetNetwork

	if (!isWrongNetwork) {
		return (
			<div className="flex flex-col gap-3 rounded-xl border border-secondary/20 bg-secondary/10 p-4">
				<div className="flex items-center gap-2">
					<NetworkBadge network={targetNetwork} />
				</div>
				<TypographySmall className="text-[11px] leading-snug text-muted-foreground">
					Your wallet is connected to the correct network. This submission will
					be anchored on{" "}
					<span className="font-bold text-foreground">
						{NetworkToMessage[targetNetwork]}
					</span>
					.
				</TypographySmall>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-3 rounded-xl border border-error/20 bg-error/5 p-4">
			<div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2">
				<TypographySmall className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
					Target
				</TypographySmall>
				<NetworkBadge network={targetNetwork} />
				<TypographySmall className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
					Wallet
				</TypographySmall>
				{connectedNetwork === "unknown" ? (
					<TypographySmall className="text-[11px] font-medium text-muted-foreground">
						Unknown or unsupported chain
					</TypographySmall>
				) : (
					<NetworkBadge network={connectedNetwork} />
				)}
			</div>
			<TypographySmall className="border-t border-error/20 pt-3 text-[11px] leading-snug text-muted-foreground">
				Switch your wallet to submit on{" "}
				<span className="font-bold text-foreground">
					{NetworkToMessage[targetNetwork]}
				</span>
				.
			</TypographySmall>
			<Button
				type="button"
				size="sm"
				onClick={onSwitchChain}
				className="w-full border border-error/30 bg-error/10 text-error transition-colors hover:bg-error/20"
			>
				Switch to {NetworkToMessage[targetNetwork]}
			</Button>
		</div>
	)
}
