"use client"

import { useMemberDetails } from "@/app/_hooks/use-member-details"
import { Loader2Icon } from "lucide-react"
import { FC, useEffect, useState } from "react"
import { ActiveReviewerWorkspace } from "./active-reviewer-workspace"
import { ReviewerRegistration } from "./reviewer-registration"

type Props = {
  minStake: bigint
}
export const PeerReviewWrapper: FC<Props> = (props) => {
  const { minStake: reviewerMinStake } = props

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const member = useMemberDetails({ mounted })

  if (!member || !mounted) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Loader2Icon className="h-6 w-6 animate-spin" />
        <p className="text-sm text-muted-foreground">Syncing protocol state...</p>
      </div>
    )
  }

  if (!member.isReviewer) {
    return <ReviewerRegistration minStake={reviewerMinStake} />
  }

  return <ActiveReviewerWorkspace />
}
