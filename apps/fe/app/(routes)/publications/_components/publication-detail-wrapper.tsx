import { PublicationDetailsProvider } from "@/_context/publication-details-provider"
import { ManifestCardSkeleton } from "@/app/_components/manifest-card-skeleton"
import { ManifestCardWrapper } from "@/app/_components/manifest-card-wrapper"
import { PublicationMainContentContainer } from "@/app/_components/publication-main-content-container"
import { VerdictCardSkeleton } from "@/app/_components/verdict-card-skeleton"
import { VerdictCardWrapper } from "@/app/_components/verdict-card-wrapper"
import { getProtocolByChain, getPublicationById } from "@packages/cqrs"
import { notFound } from "next/navigation"
import { FC, Suspense } from "react"
import { EconomicsSidebarContainer } from "./economics-sidebar-container"
import { VerdictTimeLineContainer } from "./verdict-time-line-container"

type Props = { id: string } // "chainId-pubId"

export const PublicationDetailWrapper: FC<Props> = async (props) => {
  const { id } = props

  const publication = await getPublicationById({ id })
  if (!publication) { return notFound() }

  const protocol = await getProtocolByChain({ chainId: publication.chainId })

  return (
    <PublicationDetailsProvider initialPublication={publication}>
      <div className="grid grid-cols-1 @5xl:grid-cols-3 gap-8 items-start max-w-7xl mx-auto">
        {/* Main Research Content Column */}
        <PublicationMainContentContainer>
          {/* Wrap IPFS fetch in separate Suspense boundary */}
          {
            publication?.verdictCid &&
            <Suspense fallback={<VerdictCardSkeleton />}>
              <VerdictCardWrapper
                verdictCid={publication.verdictCid}
              />
            </Suspense>
          }

          {
            publication?.cid &&
            <Suspense fallback={<ManifestCardSkeleton />}>
              <ManifestCardWrapper
                rootCid={publication.cid}
              />
            </Suspense>
          }
        </PublicationMainContentContainer>

        {/* Protocol Metrics & History Sidebar */}
        <aside className="space-y-8 sticky top-8">
          <section className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
              Validation Trail
            </h3>
            <div className="bg-card/30 rounded-xl border border-border/50 p-6">
              <VerdictTimeLineContainer />
            </div>
          </section>

          {protocol && (
            <section className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
                Economic Breakdown
              </h3>
              <EconomicsSidebarContainer protocol={protocol} />
            </section>
          )
          }

        </aside>
      </div>
    </PublicationDetailsProvider>
  )
}