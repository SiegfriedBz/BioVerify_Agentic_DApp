import { TypographyP, TypographySmall } from "@/app/_components/typography"
import { ProtocolPublicationStatus, ProtocolPublicationStatusSchema } from "@/lib/protocol/schemas/protocol-publication"
import { cn } from "@/lib/utils"
import { CheckCircle2Icon, CircleDashedIcon, FileTextIcon, LucideIcon, ShieldAlertIcon, UsersIcon, XCircleIcon } from "lucide-react"
import { FC } from "react"

type TimelineStep = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  isReached: (s: ProtocolPublicationStatus, hasReviewers: boolean) => boolean
  isFailed: (s: ProtocolPublicationStatus, hasReviewers: boolean) => boolean
  isCurrent: (s: ProtocolPublicationStatus, hasReviewers: boolean) => boolean
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: "SUBMITTED",
    title: "Publication Submitted",
    description: "Publisher staked funds and uploaded research to IPFS.",
    icon: FileTextIcon,
    isReached: () => true,
    isFailed: () => false,
    isCurrent: (s) => s === ProtocolPublicationStatusSchema.enum.SUBMITTED
  },
  {
    id: "AI_SHIELD",
    title: "AI Integrity Shield",
    description: "LangGraph agent performing plagiarism checks.",
    icon: ShieldAlertIcon,
    isReached: (s) => s !== ProtocolPublicationStatusSchema.enum.SUBMITTED,
    isFailed: (s, hasReviewers) => s === ProtocolPublicationStatusSchema.enum.SLASHED && !hasReviewers,
    isCurrent: (s) => s === ProtocolPublicationStatusSchema.enum.SUBMITTED // Transitioning
  },
  {
    id: "CONSENSUS",
    title: "Consensus",
    description: "Meritocratic peer and senior reviewers verdicts.",
    icon: UsersIcon,
    isReached: (s, hasReviewers) => hasReviewers || s === ProtocolPublicationStatusSchema.enum.PUBLISHED,
    isFailed: (s, hasReviewers) => s === ProtocolPublicationStatusSchema.enum.SLASHED && hasReviewers,
    isCurrent: (s) => s === ProtocolPublicationStatusSchema.enum.IN_REVIEW
  },
  {
    id: "FINAL_VERDICT",
    title: "Final Verdict",
    description: "Protocol finalized. Funds distributed or bad actors slashed.",
    icon: CheckCircle2Icon,
    isReached: (s) => s === ProtocolPublicationStatusSchema.enum.PUBLISHED || s === ProtocolPublicationStatusSchema.enum.SLASHED,
    isFailed: (s) => s === ProtocolPublicationStatusSchema.enum.SLASHED,
    isCurrent: (s) => s === ProtocolPublicationStatusSchema.enum.PUBLISHED || s === ProtocolPublicationStatusSchema.enum.SLASHED
  }
]

type VerdictTimelineProps = {
  currentStatus: ProtocolPublicationStatus
  hasReviewers: boolean
}

export const VerdictTimeline: FC<VerdictTimelineProps> = ({ currentStatus, hasReviewers }) => {
  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-border/50">
      {TIMELINE_STEPS.map((step) => {
        const reached = step.isReached(currentStatus, hasReviewers)
        const failed = step.isFailed(currentStatus, hasReviewers)
        const active = step.isCurrent(currentStatus, hasReviewers)

        // Select icon based on state
        let StepIcon = step.icon
        if (failed) StepIcon = XCircleIcon
        if (active && !reached && !failed) StepIcon = CircleDashedIcon

        return (
          <div key={step.id} className="relative flex items-start gap-6 group">
            <div className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-background z-10 transition-all",
              failed ? "border-destructive text-destructive bg-destructive/5" :
                reached ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground",
              active && !failed && currentStatus !== ProtocolPublicationStatusSchema.enum.PUBLISHED && "ring-4 ring-primary/10 animate-pulse"
            )}>
              <StepIcon className={cn("h-5 w-5", active && !reached && "animate-spin")} />
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