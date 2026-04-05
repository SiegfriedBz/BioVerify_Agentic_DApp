"use client"

import { TypographyP, TypographySmall } from "@/app/_components/typography"
import { cn } from "@/lib/utils"
import type { PublicationStatus } from "@packages/schema"
import { CircleDashedIcon, XCircleIcon } from "lucide-react"
import type { FC } from "react"
import { TIMELINE_STEPS } from "./time-line-steps"

type Props = {
	currentStatus: PublicationStatus
}

export const VerdictTimeline: FC<Props> = (props) => {
	const { currentStatus } = props

	return (
		<div className="relative">
			{TIMELINE_STEPS.map((step, index) => {
				const reached = step.isReached(currentStatus)
				const failed = step.isFailed(currentStatus)
				const active = step.isCurrent(currentStatus)
				const isLast = index === TIMELINE_STEPS.length - 1

				// Select icon based on state logic
				let StepIcon = step.icon
				if (failed) StepIcon = XCircleIcon
				if (active && !reached && !failed) StepIcon = CircleDashedIcon

				return (
					<div key={step.id} className={cn("relative", !isLast && "pb-4")}>
						{!isLast && (
							<div
								className={cn(
									"absolute left-5 -translate-x-px top-10 bottom-0 w-0.5",
									reached ? "bg-primary/50" : "bg-border/30",
								)}
							/>
						)}
						<div className="relative flex h-22 items-start gap-6 group">
							<div
								className={cn(
									"flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-background z-10 transition-all",
									failed
										? "border-error text-error bg-error/10"
										: reached
											? "border-primary text-primary bg-primary/5"
											: "border-border text-muted-foreground",
									active &&
									!failed &&
									!reached &&
									"ring-4 ring-primary/10 animate-pulse",
								)}
							>
								<StepIcon
									className={cn(
										"h-5 w-5",
										active && !reached && !failed && "animate-spin",
									)}
								/>
							</div>

							<div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1 pt-1">
								<TypographySmall
									className={cn(
										"font-bold uppercase tracking-widest text-[10px] line-clamp-2",
										failed
											? "text-error"
											: reached
												? "text-foreground"
												: "text-muted-foreground",
									)}
								>
									{step.title} {failed && "— REJECTED"}
								</TypographySmall>
								<TypographyP className="mt-0! line-clamp-3 text-xs text-muted-foreground leading-relaxed">
									{step.description}
								</TypographyP>
							</div>
						</div>
					</div>
				)
			})}
		</div>
	)
}
