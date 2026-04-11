"use client"

import {
	AlertCircleIcon,
	FuelIcon,
	LandmarkIcon,
	WalletIcon,
} from "lucide-react"
import { type FC, useMemo } from "react"
import { formatEther, parseEther } from "viem"
import { TypographyP, TypographySmall } from "@/app/_components/typography"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type Props = {
	userStakeInput: string
	minStakeWei: bigint | null // From Server Component
	effectiveFeeWei: bigint | null // From custom hook
}

export const FeeCalculator: FC<Props> = ({
	userStakeInput,
	minStakeWei,
	effectiveFeeWei,
}) => {
	const isLoading = minStakeWei === null || effectiveFeeWei === null

	const stakeWei = useMemo(() => {
		try {
			return parseEther(userStakeInput || "0")
		} catch {
			return 0n
		}
	}, [userStakeInput])

	const totalWei = !isLoading ? stakeWei + (effectiveFeeWei ?? 0n) : 0n
	const isInsufficient = !isLoading && stakeWei < (minStakeWei ?? 0n)

	return (
		<Card className="border-primary/20 bg-primary/2 overflow-hidden shadow-sm transition-all">
			<div className="bg-primary/5 px-4 py-2 border-b border-primary/10 flex justify-between items-center h-10">
				<TypographySmall className="font-bold text-primary uppercase tracking-tighter">
					Submission Audit
				</TypographySmall>
				{isInsufficient && (
					<div className="flex items-center gap-1 text-error animate-pulse">
						<AlertCircleIcon className="h-3 w-3" />
						<span className="text-[9px] font-bold uppercase">
							Below Min Stake
						</span>
					</div>
				)}
			</div>

			<CardContent className="p-5 space-y-4">
				{/* Requirement 1: The Fee */}
				<div className="flex justify-between items-start">
					<div className="flex gap-2">
						<FuelIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
						<div className="flex flex-col">
							<TypographySmall className="font-medium">
								Protocol Fee
							</TypographySmall>
							<TypographySmall className="text-[10px] text-muted-foreground">
								Covers VRF & Platform
							</TypographySmall>
						</div>
					</div>
					{isLoading ? (
						<Skeleton className="h-5 w-16 mt-1" />
					) : (
						<span className="font-mono text-sm">
							{formatEther(effectiveFeeWei ?? 0n)} ETH
						</span>
					)}
				</div>

				{/* Requirement 2: The Stake */}
				<div className="flex justify-between items-start">
					<div className="flex gap-2">
						<LandmarkIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
						<div className="flex flex-col">
							<TypographySmall className="font-medium">
								Your Research Stake
							</TypographySmall>
							<div className="flex items-center gap-1 h-4">
								<TypographySmall className="text-[10px] text-muted-foreground">
									Minimum required:
								</TypographySmall>
								{isLoading ? (
									<Skeleton className="h-2 w-10" />
								) : (
									<TypographySmall className="text-[10px] text-muted-foreground font-bold">
										{minStakeWei ? formatEther(minStakeWei) : "0"} ETH
									</TypographySmall>
								)}
							</div>
						</div>
					</div>
					<span
						className={`font-mono text-sm ${isInsufficient ? "text-error font-bold" : ""}`}
					>
						{userStakeInput || "0.00"} ETH
					</span>
				</div>

				{/* The Final msg.value */}
				<div className="pt-4 border-t border-primary/10 flex justify-between items-center">
					<div className="flex items-center gap-2">
						<WalletIcon className="h-4 w-4 text-primary" />
						<TypographyP className="font-bold mt-0!">Total Payable</TypographyP>
					</div>
					<div className="text-right flex flex-col items-end">
						{isLoading ? (
							<Skeleton className="h-8 w-24 bg-primary/10 mb-1" />
						) : (
							<TypographyP className="font-mono font-bold text-primary mt-0! text-xl">
								{formatEther(totalWei)} ETH
							</TypographyP>
						)}
						<TypographySmall className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">
							msg.value
						</TypographySmall>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
