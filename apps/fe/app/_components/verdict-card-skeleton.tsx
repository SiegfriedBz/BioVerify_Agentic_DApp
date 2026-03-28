import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FC } from "react"

export const VerdictCardSkeleton: FC = () => {
  return (
    <Card className="overflow-hidden border-border bg-card shadow-sm">
      <CardHeader className="bg-muted/30 pb-8 space-y-4">
        <div className="flex justify-between items-start gap-6">
          {/* Verdict Title */}
          <Skeleton className="h-8 w-32" />
          {/* Status Badge */}
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        {/* IPFS CID Badge */}
        <Skeleton className="h-8 w-64 rounded-md" />
      </CardHeader>

      <CardContent className="pt-8 space-y-10">
        <section className="space-y-3">
          {/* Verdict Content Lines */}
          <div className="border-l-2 border-muted pl-6 py-1 space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
          </div>
        </section>
      </CardContent>
    </Card>
  )
}