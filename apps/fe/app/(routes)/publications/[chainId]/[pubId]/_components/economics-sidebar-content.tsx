"use client"

import { TypographySmall } from "@/app/_components/typography"
import { CardContent } from "@/components/ui/card"
import type { Protocol, Publication } from "@packages/schema"
import type { FC } from "react"

type Props = {
  publication: Publication
  protocol: Protocol
}

export const EconomicsSidebarContent: FC<Props> = (props) => {
  const { publication, protocol } = props

  return (
    <CardContent className="space-y-4">
      <div className="flex justify-between items-end border-b border-border/30 pb-3">
        <TypographySmall className="text-muted-foreground">
          Total Locked Stake
        </TypographySmall>
        <div className="text-right flex items-baseline">
          <span className="font-mono font-bold text-base text-primary">
            {publication.lockedStake}
          </span>
          <TypographySmall className="ml-1 text-[10px] text-muted-foreground">
            ETH
          </TypographySmall>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <TypographySmall className="text-muted-foreground">
          Paid Submission Fee
        </TypographySmall>
        <div className="text-right">
          <span className="font-mono font-medium text-sm">
            {publication.paidSubmissionFee}
          </span>
          <TypographySmall className="ml-1 text-[10px] text-muted-foreground">
            ETH
          </TypographySmall>
        </div>
      </div>

      <div className="flex justify-between items-center opacity-70">
        <TypographySmall className="text-[10px] uppercase">
          Publisher Stake
        </TypographySmall>
        <TypographySmall className="font-mono">
          {protocol?.publisherStake ?? "..."} ETH
        </TypographySmall>
      </div>

      <div className="flex justify-between items-center opacity-70">
        <TypographySmall className="text-[10px] uppercase">
          Base Reviewer Stake
        </TypographySmall>
        <TypographySmall className="font-mono">
          {protocol?.reviewerStake ?? "..."} ETH
        </TypographySmall>
      </div>
    </CardContent>
  )
}

