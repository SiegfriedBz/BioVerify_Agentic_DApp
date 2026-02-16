import { PublicationMainContent } from "@/app/(routes)/_components/publication-main-content"
import { getPublicationDetailsMock } from "@/lib/protocol/get-publication-details"
import { ProtocolPublicationMapper } from "@/lib/protocol/mappers/protocol-publication-mapper"
import { notFound } from "next/navigation"
import { VerdictForm } from "./verdict-form"

type Props = { pubId: string }

export const ExecuteReviewContainer = async ({ pubId }: Props) => {
  // TODO call getPublicationDetails after next solidty deployment
  const data = await getPublicationDetailsMock()
  if (!data) notFound()

  const publication = ProtocolPublicationMapper(data)

  return (

    <div className="grid grid-cols-1 @5xl:grid-cols-3 gap-8 items-start max-w-7xl mx-auto">
      <PublicationMainContent publication={publication} />

      <aside className="space-y-8 sticky top-8">
        <section className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
            Reviewer Decision
          </h3>
          <VerdictForm publication={publication} />
        </section>
      </aside>
    </div>

  )
}