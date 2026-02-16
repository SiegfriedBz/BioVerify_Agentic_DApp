import { getPublicationDetailsMock } from "@/lib/protocol/get-publication-details"
import { ProtocolPublicationMapper } from "@/lib/protocol/mappers/protocol-publication-mapper"
import { notFound } from "next/navigation"
import { EconomicsSidebar } from "./economics-sidebar"

import { PublicationMainContent } from "../../_components/publication-main-content"
import { VerdictTimeline } from "./verdict-timeline"

type Props = { pubId: string }

export const PublicationDetailContainer = async ({ pubId }: Props) => {
  // TODO call getPublicationDetails after next solidty deployment
  const data = await getPublicationDetailsMock()
  if (!data) notFound()

  const publication = ProtocolPublicationMapper(data)

  const hasReviewers = publication.reviewers && publication.reviewers.length > 0

  return (
    <div className="grid grid-cols-1 @5xl:grid-cols-3 gap-8 items-start max-w-7xl mx-auto">
      {/* Main Research Content Column */}
      <PublicationMainContent
        publication={publication}
      />

      {/* Protocol Metrics & History Sidebar */}
      <aside className="space-y-8 sticky top-8">
        <section className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
            Validation Trail
          </h3>
          <div className="bg-card/30 rounded-xl border border-border/50 p-6">
            <VerdictTimeline
              currentStatus={publication.status}
              hasReviewers={hasReviewers}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
            Economic Breakdown
          </h3>
          <EconomicsSidebar publication={publication} />
        </section>
      </aside>
    </div>
  )
}