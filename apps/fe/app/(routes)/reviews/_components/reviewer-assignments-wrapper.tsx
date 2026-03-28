import { getMemberAssignments } from "@packages/cqrs"
import { FC } from "react"
import { ReviewerAssignmentsContainer } from "./reviewer-assignments-container"

type Props = {
  server: {
    userAddress: string
    chainId: number
  }
}

export const ReviewerAssignmentsWrapper: FC<Props> = async (props) => {
  const { server } = props

  const initialData = await getMemberAssignments({ userAddress: server.userAddress })

  return (
    <ReviewerAssignmentsContainer
      server={{
        userAddress: server.userAddress,
        chainId: server.chainId,
        initialData
      }}
    />
  )
}
