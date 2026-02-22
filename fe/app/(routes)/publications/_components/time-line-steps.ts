import { ProtocolPublicationStatus, ProtocolPublicationStatusSchema } from "@/app/_schemas/schemas/contract/protocol-publication"
import { CheckCircle2Icon, FileTextIcon, LucideIcon, ShieldAlertIcon, UsersIcon } from "lucide-react"

type TimelineStep = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  isReached: (s: ProtocolPublicationStatus, hasReviewers: boolean) => boolean
  isFailed: (s: ProtocolPublicationStatus, hasReviewers: boolean) => boolean
  isCurrent: (s: ProtocolPublicationStatus, hasReviewers: boolean) => boolean
}

export const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: "SUBMITTED",
    title: "Publication Submitted",
    description: "Publisher staked funds and uploaded research to IPFS.",
    icon: FileTextIcon,
    isReached: () => true, // Always reached if rendered
    isFailed: () => false,
    isCurrent: () => false // Discrete past action; does not spin
  },
  {
    id: "AI_SHIELD",
    title: "AI Integrity Shield",
    description: "LangGraph agent performing plagiarism checks.",
    icon: ShieldAlertIcon,
    isReached: (s) => s !== ProtocolPublicationStatusSchema.enum.SUBMITTED,
    isFailed: (s, hasReviewers) => s === ProtocolPublicationStatusSchema.enum.SLASHED && !hasReviewers,
    isCurrent: (s) => s === ProtocolPublicationStatusSchema.enum.SUBMITTED // Spinning while waiting for Agent
  },
  {
    id: "CONSENSUS",
    title: "Consensus",
    description: "Meritocratic peer and senior reviewers verdicts.",
    icon: UsersIcon,
    // Consensus is only REACHED (completed) once a final verdict is cast
    isReached: (s, hasReviewers) => s === ProtocolPublicationStatusSchema.enum.PUBLISHED || (s === ProtocolPublicationStatusSchema.enum.SLASHED && hasReviewers),
    // Consensus FAILS if reviewers slash it
    isFailed: (s, hasReviewers) => s === ProtocolPublicationStatusSchema.enum.SLASHED && hasReviewers,
    // Consensus is CURRENT (spinning) during VRF wait AND Reviewer voting
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