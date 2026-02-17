
"use client"

import { MappedProtocolReviewerAssignment } from "@/lib/protocol/mappers/protoccol-reviewer-assignmement-mapper"
import { FC } from "react"
import { ReviewAssignmentsTable } from "./review-assignments-table"

const getAssignmentsMock = (): MappedProtocolReviewerAssignment[] => {
  return [
    {
      pubId: 1,
      cid: "ljkblblb",
      isSeniorReviewer: false
    },
    {
      pubId: 2,
      cid: "ljkblblb",
      isSeniorReviewer: true
    }
  ]
}

export const ReviewAssignmentsTableWrapper: FC = () => {
  // TODO use this custom hook after next solidty deployment
  //   const {
  // assignments: data,
  // isLoading,
  // isError} = useGetProtocolReviewerAssignments()

  // const assignments = data.map(ProtocolReviewerAssignmentMapper)

  const assignments = getAssignmentsMock()

  return <ReviewAssignmentsTable assignments={assignments} />
}