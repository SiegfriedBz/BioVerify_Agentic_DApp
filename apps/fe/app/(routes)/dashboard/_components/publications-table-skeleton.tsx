import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { FC } from "react"

export const PublicationsTableSkeleton: FC = () => {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Toolbar Skeleton */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9 w-24 bg-muted/50 self-end" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 bg-muted/50" />
          <Skeleton className="h-9 w-20 bg-muted/50" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-xl border border-border bg-card/30 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-transparent border-border">
              <TableHead className="w-20"><Skeleton className="h-3 w-6 bg-muted/50" /></TableHead>
              <TableHead><Skeleton className="h-3 w-20 bg-muted/50" /></TableHead>
              <TableHead><Skeleton className="h-3 w-24 bg-muted/50" /></TableHead>
              <TableHead><Skeleton className="h-3 w-16 bg-muted/50" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i} className="border-border">
                <TableCell><Skeleton className="h-4 w-10 bg-muted/30" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32 bg-muted/30" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24 rounded-full bg-muted/30" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12 bg-muted/30" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}