"use client"

import { FC } from "react"
import { ActiveReviewerWorkspace } from "./active-reviewer-workspace"

type Props = {
  minStake: bigint
}
export const PeerReviewWrapper: FC<Props> = (props) => {
  const { minStake: reviewerMinStake } = props

  //TODO To unlock after contract deployment
  // const member = useGetProtocolMember()

  // if (!member || !member.isReviewer) {
  //   return <ReviewerRegistration minStake={reviewerMinStake || 0n} />
  // }

  return <ActiveReviewerWorkspace />
}