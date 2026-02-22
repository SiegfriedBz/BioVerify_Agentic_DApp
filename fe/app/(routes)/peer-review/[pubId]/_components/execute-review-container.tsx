import { PublicationMainContent } from "@/app/(routes)/_components/publication-main-content"
import { ProtocolPublicationMapper } from "@/app/_schemas/mappers/protocol-publication-mapper"
import { getPublicationDetails } from "@/app/api/contract/get-publication-details"
import { notFound } from "next/navigation"
import { VerdictForm } from "./verdict-form"

type Props = { pubId: string }

export const ExecuteReviewContainer = async ({ pubId }: Props) => {
  const data = await getPublicationDetails({ id: pubId })
  if (!data) { return notFound() }

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