"use client"

import { TypographyP, TypographySmall } from "@/app/_components/typography"
import { ProtocolPublicationStatus } from "@/app/_schemas/schemas/contract/protocol-publication"
import { cn } from "@/lib/utils"
import { CircleDashedIcon, XCircleIcon } from "lucide-react"
import { FC } from "react"
import { TIMELINE_STEPS } from "./time-line-steps"

type Props = {
  currentStatus: ProtocolPublicationStatus
  hasReviewers: boolean
}

export const VerdictTimeline: FC<Props> = (props) => {
  const { currentStatus, hasReviewers } = props

  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-border/50">
      {TIMELINE_STEPS.map((step) => {
        const reached = step.isReached(currentStatus, hasReviewers)
        const failed = step.isFailed(currentStatus, hasReviewers)
        const active = step.isCurrent(currentStatus, hasReviewers)

        // Select icon based on state logic
        let StepIcon = step.icon
        if (failed) StepIcon = XCircleIcon
        if (active && !reached && !failed) StepIcon = CircleDashedIcon

        return (
          <div key={step.id} className="relative flex items-start gap-6 group">
            <div className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-background z-10 transition-all",
              failed ? "border-destructive text-destructive bg-destructive/5" :
                reached ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground",
              active && !failed && !reached && "ring-4 ring-primary/10 animate-pulse"
            )}>
              <StepIcon className={cn("h-5 w-5", active && !reached && !failed && "animate-spin")} />
            </div>

            <div className="flex flex-col gap-1 pt-1">
              <TypographySmall className={cn(
                "font-bold uppercase tracking-widest text-[10px]",
                failed ? "text-destructive" : reached ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.title} {failed && "— REJECTED"}
              </TypographySmall>
              <TypographyP className="mt-0! text-xs text-muted-foreground leading-relaxed">
                {step.description}
              </TypographyP>
            </div>
          </div>
        )
      })}
    </div>
  )
}