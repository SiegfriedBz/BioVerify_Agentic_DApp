import { PublicationStatus, PublicationStatusSchema } from "@packages/schema"
import { CheckCircle2Icon, FileTextIcon, LucideIcon, ShieldAlertIcon, UsersIcon } from "lucide-react"

type TimelineStep = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  isReached: (s: PublicationStatus) => boolean
  isFailed: (s: PublicationStatus) => boolean
  isCurrent: (s: PublicationStatus) => boolean
}

const Status = PublicationStatusSchema.enum

export const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: "SUBMITTED",
    title: "Publication Submitted",
    description: "Publisher staked funds and uploaded research to IPFS.",
    icon: FileTextIcon,
    isReached: () => true, // Always reached 
    isFailed: () => false,
    isCurrent: () => false // Discrete past action
  },
  {
    id: "AI_SHIELD",
    title: "AI Integrity Shield",
    description: "LangGraph agent performing plagiarism checks.",
    icon: ShieldAlertIcon,
    // Reached (passed) if it's in review, published, or human-slashed
    isReached: (s) => ([Status.IN_REVIEW, Status.PUBLISHED, Status.SLASHED] as PublicationStatus[]).includes(s),
    // Failed if the agent caught it
    isFailed: (s) => s === Status.EARLY_SLASHED,
    // Current (spinning) while waiting for the Agent
    isCurrent: (s) => s === Status.SUBMITTED
  },
  {
    id: "CONSENSUS",
    title: "Consensus",
    description: "Meritocratic peer and senior reviewers verdicts.",
    icon: UsersIcon,
    // Reached (completed) if published or human-slashed
    isReached: (s) => ([Status.PUBLISHED, Status.SLASHED] as PublicationStatus[]).includes(s),
    // Failed if human reviewers slashed it
    isFailed: (s) => s === Status.SLASHED,
    // Current (spinning) during VRF wait AND Reviewer voting
    isCurrent: (s) => s === Status.IN_REVIEW
  },
  {
    id: "FINAL_VERDICT",
    title: "Final Verdict",
    description: "Protocol finalized. Funds distributed or bad actors slashed.",
    icon: CheckCircle2Icon,
    isReached: (s) => ([Status.PUBLISHED, Status.SLASHED, Status.EARLY_SLASHED] as PublicationStatus[]).includes(s),
    isFailed: (s) => ([Status.SLASHED, Status.EARLY_SLASHED] as PublicationStatus[]).includes(s),
    isCurrent: (s) => ([Status.PUBLISHED, Status.SLASHED, Status.EARLY_SLASHED] as PublicationStatus[]).includes(s)
  }
]