"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ComponentProps, FC } from "react"
import { useHasSubmittedReview } from "../_hooks/use-has-submitted-review"

type Props = ComponentProps<typeof Badge> & {
  reviewerAddress: string
  publicationId: string | bigint | number
}
export const HasSubmittedReviewBadge: FC<Props> = (props) => {
  const { reviewerAddress, publicationId, className, ...rest } = props

  const { hasSubmitted, isLoading } = useHasSubmittedReview({ reviewerAddress, publicationId })

  if (isLoading) {
    return (
      <Badge
        {...rest}
        variant="ghost"
        className={cn("animate-pulse opacity-50", className)}>
        <span className="rounded-full size-2 bg-slate-400 mr-2" />
        Checking...
      </Badge>
    )
  }

  return (
    <Badge {...rest}
      variant={"ghost"} className={cn("flex items-center gap-x-2", className)}>
      <span className={cn("rounded-full size-2",
        hasSubmitted ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-fuchsia-500"
      )} />
      <span className="text-[10px] uppercase font-bold tracking-tight">
        {hasSubmitted ? "Submitted & Verified" : "Pending"}
      </span>
    </Badge>
  )
}