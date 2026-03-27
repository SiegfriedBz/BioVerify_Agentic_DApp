"use client"

import { usePublicationDetailContext } from "@/_hooks/context/use-publication-details-ctx"
import { useAuthFromWallet } from "@/_hooks/use-auth-from-wallet"
import { AlertCircle, CheckCircle2, Lock } from "lucide-react"
import { FC, PropsWithChildren } from "react"

export const ReviewerGuard: FC<PropsWithChildren> = (props) => {
  const { children } = props

  const { publication } = usePublicationDetailContext()
  const { walletAddress } = useAuthFromWallet()
  const userAddr = walletAddress?.toLowerCase()

  // 1. Identity Checks
  const isPeer = publication?.reviewers.some((r) => r.toLowerCase() === userAddr)
  const isSenior = publication?.seniorReviewer?.toLowerCase() === userAddr
  const hasReviewed = userAddr ? publication?.reviewersStatus[userAddr] : false

  // 2. State Logic
  const totalPeerReviews = !!publication ? Object.keys(publication.reviewersStatus).filter(addr =>
    publication.reviewers.some(r => r.toLowerCase() === addr.toLowerCase())
  ).length : 0

  // persona: PUBLIC / UNAUTHORIZED
  if (!userAddr || (!isPeer && !isSenior)) {
    return (
      <div className="p-12 border-2 border-dashed rounded-xl bg-muted/5 text-center max-w-2xl mx-auto my-12">
        <Lock className="w-10 h-10 mx-auto mb-4 text-muted-foreground/40" />
        <h3 className="text-lg font-semibold tracking-tight">Restricted Assignment</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-75 mx-auto">
          This publication review is restricted to assigned peer reviewers and the designated senior auditor.
        </p>
        {!userAddr && (
          <p className="text-xs font-medium text-primary mt-4 uppercase tracking-widest">
            Please connect your wallet to verify identity
          </p>
        )}
      </div>
    )
  }

  // persona: ALREADY SUBMITTED
  if (hasReviewed) {
    return (
      <div className="p-6 border rounded-lg bg-green-500/10 border-green-500/20 text-center">
        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
        <p className="font-medium text-green-700">Verdict Recorded</p>
        {!!publication && (
          <p className="text-sm text-green-600/80">
            Your review for Pub #{publication.pubId} has been successfully hashed and stored.
          </p>
        )}
      </div>
    )
  }

  // persona: SENIOR ON STANDBY
  if (isSenior && totalPeerReviews < 2) {
    return (
      <div className="p-6 border rounded-lg bg-blue-500/10 border-blue-500/20 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-blue-600" />
        <p className="font-medium text-blue-700">Senior Standby Mode</p>
        <p className="text-sm text-blue-600/80">
          Awaiting peer reviewer submissions. You will be notified if a conflict requires your intervention.
        </p>
      </div>
    )
  }

  // persona: AUTHORIZED (Peer or Senior needing to act)
  return <>{children}</>
}