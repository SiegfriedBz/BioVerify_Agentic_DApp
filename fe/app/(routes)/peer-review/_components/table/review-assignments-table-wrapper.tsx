"use client"

import { useReviewerAssignments } from "@/app/_hooks/use-reviewer-assignements"
import { FC, useEffect, useState } from "react"
import { ReviewAssignmentsTable } from "./review-assignments-table"

export const ReviewAssignmentsTableWrapper: FC = () => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const {
    assignments,
    isLoading,
    isError } = useReviewerAssignments({ mounted })

  return <ReviewAssignmentsTable assignments={assignments} />
}