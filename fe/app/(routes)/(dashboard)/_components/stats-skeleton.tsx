// app/(routes)/dashboard/_components/new/stats-skeleton.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FC } from "react"

export const StatsSkeleton: FC = () => {
  return (
    <div className="grid grid-cols-1 @lg:grid-cols-2 @xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-border bg-card shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}