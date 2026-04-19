"use client"

import { NetworkBadge, NetworkToMessage } from "@/app/_components/network-badge"
import { TypographySmall } from "@/app/_components/typography"
import { Button } from "@/components/ui/button"
import type { NetworkT } from "@packages/schema"
import { useAppKit } from "@reown/appkit/react"
import { WalletIcon } from "lucide-react"
import type { FC } from "react"

type Props = {
	isConnected: boolean
	targetNetwork: NetworkT
	connectedNetwork: NetworkT | "unknown"
	onSwitchChain: () => void
}

const GRADIENT_BUTTON_CLASS =
	"w-full cursor-pointer border-0 bg-[linear-gradient(135deg,#a4e6ff_0%,#00d1ff_100%)] font-semibold text-[#003543] shadow-[0_4px_20px_rgba(0,209,255,0.18)] transition-[filter,box-shadow] hover:bg-[linear-gradient(135deg,#a4e6ff_0%,#00d1ff_100%)] hover:text-[#003543] hover:brightness-110 hover:shadow-[0_6px_24px_rgba(0,209,255,0.22)] active:bg-[linear-gradient(135deg,#a4e6ff_0%,#00d1ff_100%)] active:text-[#003543] [&>svg]:text-[#003543]"

export const ChainContextCard: FC<Props> = (props) => {
	const { isConnected, targetNetwork, connectedNetwork, onSwitchChain } = props
	const { open } = useAppKit()

	if (!isConnected) {
		return (
			<div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border/40 bg-muted/10 p-5 text-center">
				<div className="flex size-10 items-center justify-center rounded-full bg-muted/30 text-primary">
					<WalletIcon className="size-5" />
				</div>
				<TypographySmall className="text-[11px] leading-snug text-muted-foreground">
					Connect your wallet to submit a new publication to the BioVerify
					ledger.
				</TypographySmall>
				<Button
					type="button"
					size="sm"
					onClick={() => open()}
					className={GRADIENT_BUTTON_CLASS}
				>
					<WalletIcon className="size-4" />
					Connect Wallet
				</Button>
			</div>
		)
	}

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
