"use client"

import { FC } from "react"

type Props = {
  refetch: () => Promise<any> | void
}

export const FetchError: FC<Props> = (props) => {
  const { refetch } = props

  return (
    <div className="p-6 border border-destructive/50 rounded-xl bg-destructive/10 flex flex-col items-center gap-2 text-center">
      <h3 className="font-bold text-destructive">Network Error</h3>
      <p className="text-sm text-muted-foreground">Failed to sync with the blockchain.</p>
      <button
        onClick={() => refetch()}
        className="mt-2 text-xs underline font-bold uppercase"
      >
        Try Again
      </button>
    </div>
  )
}
