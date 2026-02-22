import { getProtocolConstants } from "@/app/api/contract/get-protocol-constants"
import { FC } from "react"
import { PeerReviewWrapper } from "./peer-review-wrapper"

export const PeerReviewContainer: FC = async () => {
  const constants = await getProtocolConstants()

  return <PeerReviewWrapper minStake={constants?.reviewerMinStake || 0n} />
}