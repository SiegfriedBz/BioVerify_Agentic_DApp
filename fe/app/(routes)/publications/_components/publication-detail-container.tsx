import { ProtocolPublicationMapper } from "@/app/_schemas/mappers/protocol-publication-mapper"
import { getPublicationDetails } from "@/app/api/contract/get-publication-details"
import { notFound } from "next/navigation"
import { PublicationMainContent } from "../../_components/publication-main-content"
import { EconomicsSidebar } from "./economics-sidebar"
import { VerdictTimeLineWrapper } from "./verdict-time-line-wrapper"

type Props = { pubId: string }

export const PublicationDetailContainer = async ({ pubId }: Props) => {
  const data = await getPublicationDetails({ id: pubId })
  if (!data) { return notFound() }

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
            <VerdictTimeLineWrapper
              publicationId={publication.id}
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