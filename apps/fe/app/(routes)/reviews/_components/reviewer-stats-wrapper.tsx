import { getMemberByChain } from "@packages/cqrs"
import { FC } from "react"
import { ReviewerStatsContainer } from "./reviewer-stats-container"

type Props = {
  server: {
    chainId: number
    userAddress: string
  }
}

export const ReviewerStatsWrapper: FC<Props> = async (props) => {
  const { server: { userAddress,
    chainId } } = props

  const member = await getMemberByChain({
    userAddress,
    chainId
  })

  if (!member) return null

  return (
    <ReviewerStatsContainer
      server={{
        userAddress,
        chainId,
        initialData: member
      }}
    />
  )
}
