import { TypographyH3 } from "@/app/_components/typography"
import { BookOpenCheck } from "lucide-react"
import { FC } from "react"
import { ReviewAssignmentsTableWrapper } from "./table/review-assignments-table-wrapper"

export const ActiveReviewerWorkspace: FC = () => {
  return (
    <div className="grid grid-cols-1 gap-8 items-start">

      {/* Left Column: Stats & Queue (Main focus) */}
      <div className="space-y-8">

        {/* The Assignments Table */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <BookOpenCheck className="h-5 w-5 text-primary" />
              <TypographyH3 className="text-xl font-bold mt-0!">Pending Assignments</TypographyH3>
            </div>
          </div>

          <ReviewAssignmentsTableWrapper />
        </section>
      </div>
    </div>
  )
}