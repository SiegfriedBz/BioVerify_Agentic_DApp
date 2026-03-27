import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FC } from "react"

export const ReviewFormSkeleton: FC = () => {
  return (
    <Card className="border-border shadow-md overflow-hidden">
      <CardHeader className="bg-muted/30 border-b pb-4 space-y-3">
        {/* Title and Role Badge */}
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-24 rounded-full -ms-2" />
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Decision Toggle Group */}
        <div className="space-y-3">
          <Skeleton className="h-3 w-16" /> {/* Label */}
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 w-full rounded-md" /> {/* Pass */}
            <Skeleton className="h-20 w-full rounded-md" /> {/* Fail */}
          </div>
        </div>

        {/* Reason Textarea */}
        <div className="space-y-3">
          <Skeleton className="h-3 w-16" /> {/* Label */}
          {/* min-h-30 in Tailwind is 120px */}
          <Skeleton className="h-30 w-full rounded-md" />
          <Skeleton className="h-3 w-3/4" /> {/* Description text */}
        </div>
      </CardContent>

      <CardFooter>
        {/* Button Group */}
        <div className="flex w-full items-center">
          <Skeleton className="h-12 w-1/3 rounded-r-none" />
          <div className="h-12 w-px bg-border/50" /> {/* Separator */}
          <Skeleton className="h-12 w-2/3 rounded-l-none" />
        </div>
      </CardFooter>
    </Card>
  )
}