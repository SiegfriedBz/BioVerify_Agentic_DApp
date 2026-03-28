import { Skeleton } from "@/components/ui/skeleton"
import { FC } from "react"

export const ReviewerAssignmentsSkeleton: FC = () => {
  return (
    <div className="space-y-4">
      {/* Title */}
      <h3 className="text-xl font-bold">Your Assignments</h3>

      <div className="border rounded-md">
        {/* Table Toolbar Area */}
        <div className="p-4 border-b flex gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-5 p-4 bg-muted/50 border-b gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>

        {/* Table Body (Rows) */}
        <div className="divide-y">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="grid grid-cols-5 p-4 gap-4 items-center">
              {[1, 2, 3, 4, 5].map((col) => (
                <Skeleton key={col} className="h-5 w-full" />
              ))}
            </div>
          ))}
        </div>

        {/* Pagination Area */}
        <div className="p-4 border-t flex justify-between items-center">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}