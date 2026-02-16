"use client"

import { useGetProtocolReviewerAssignments } from "@/app/_hooks/use-get-protocol-reviewer-assignements"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2Icon, ShieldAlert } from "lucide-react"
import { FC, PropsWithChildren } from "react"

type Props = {
  pubId: string
}

export const ReviewGuard: FC<PropsWithChildren<Props>> = (props) => {
  const { pubId, children } = props

  const { assignments, isLoading, isError } = useGetProtocolReviewerAssignments()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Check authorization
  const isAuthorized = assignments?.some(a => a.pubId.toString() === pubId)

  if (isAuthorized) {
    return (
      <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle className="font-bold">Unauthorized Access</AlertTitle>
        <AlertDescription>
          Your wallet address is not registered as a reviewer for Publication #{pubId}.
          If you were recently assigned, please wait a few moments for the chain to sync.
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}