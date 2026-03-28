import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FC } from "react"

export const ReviewerStatsSkeleton: FC = () => {
  return (
    <div className="space-y-6">
      {/* Skeleton for the Availability Alert (optional, but good for height stability) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  )
}