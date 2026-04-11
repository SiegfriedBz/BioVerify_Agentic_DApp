"use client"

import { usePublicationDetailContext } from "@/_hooks/context/use-publication-details-ctx"
import { TypographyH3 } from "@/app/_components/typography"
import { Button } from "@/components/ui/button"
import { PublicationStatusSchema } from "@packages/schema"
import { ExternalLink, FileXIcon } from "lucide-react"
import Link from "next/link"
import type { FC, PropsWithChildren } from "react"

export const PublicationStatusGuard: FC<PropsWithChildren> = (props) => {
  const { children } = props
  const { publication } = usePublicationDetailContext()

  if (publication?.status === PublicationStatusSchema.enum.IN_REVIEW) {
    return <>{children}</>
  }

  const detailHref = `/publications/${publication?.chainId}/${publication?.pubId}`

  return (
    <div className="mx-auto my-12 flex max-w-2xl flex-col items-center rounded-2xl border-2 border-dashed border-border/40 bg-muted/5 p-12 text-center">
      <div
        aria-hidden
        className="mb-4 flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted/10 text-muted-foreground/40 ring-1 ring-border/20"
      >
        <FileXIcon className="size-7" strokeWidth={1.5} />
      </div>
      <TypographyH3 className="mt-0! scroll-m-0 border-0 pb-0 text-lg font-semibold tracking-tight">
        Not In Review
      </TypographyH3>
      <p className="mx-auto mt-2 max-w-75 text-sm text-muted-foreground">
        Publication #{publication?.id} is not currently in review.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link href={detailHref}>
          <ExternalLink className="size-4" />
          View publication details
        </Link>
      </Button>
    </div>
  )
}
