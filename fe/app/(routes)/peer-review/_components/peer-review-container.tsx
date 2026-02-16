import { getProtocolConstantsMock } from "@/lib/protocol/get-protocol-constants"
import { FC } from "react"
import { PeerReviewWrapper } from "./peer-review-wrapper"

export const PeerReviewContainer: FC = async () => {
  // TODO call getProtocolConstants after next solidty deployment
  const constants = await getProtocolConstantsMock()

  return <PeerReviewWrapper minStake={constants?.reviewerMinStake || 0n} />
}