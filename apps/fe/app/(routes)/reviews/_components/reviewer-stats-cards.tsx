"use client"

import { SyncIndicator } from "@/app/_components/sync-indicator"
import { TypographySmall } from "@/app/_components/typography"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Member } from "@packages/schema"
import { FC } from "react"

type Props = {
  member: Member
  isSyncing: boolean
}

export const ReviewerStatsCards: FC<Props> = (props) => {
  const { member, isSyncing } = props

  return (
    <div className="relative">
      {isSyncing && <SyncIndicator />}

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity duration-300 ${isSyncing ? 'opacity-70' : 'opacity-100'}`}>
        <StatCard title="Available Stake" value={`${member.availableStake} ETH`} />
        <StatCard title="Locked Stake" value={`${member.lockedStake} ETH`} />
        <StatCard title="Reputation" value={member.reputation.toString()} />
      </div>
    </div>
  )
}

const StatCard = ({ title, value }: { title: string; value: string }) => (
  <Card className="bg-card/50">
    <CardHeader className="pb-2">
      <TypographySmall className="text-muted-foreground uppercase text-[10px] font-bold">
        {title}
      </TypographySmall>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-mono font-bold">{value}</div>
    </CardContent>
  </Card>
)