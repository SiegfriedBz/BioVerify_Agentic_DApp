import { MappedProtocolPublication } from "@/app/_schemas/mappers/protocol-publication-mapper"
import { FC, Suspense } from "react"
import { ManifestCard } from "./manifest-card"
import { ManifestCardSkeleton } from "./manifest-card-skeleton"
import { PublicationHeader } from "./publication-header"
import { VerdictCard } from "./verdict-card"
import { VerdictCardSkeleton } from "./verdict-card-skeleton"


type Props = {
  publication: MappedProtocolPublication
}
export const PublicationMainContent: FC<Props> = props => {
  const { publication } = props

  const rootCid = publication.cids.at(-1)

  return (<div className="@5xl:col-span-2 space-y-8" >
    <PublicationHeader
      pubId={publication.id}
      publisher={publication.publisher}
      status={publication.status}
    />

    {/* Wrap IPFS fetch in separate Suspense boundary */}

    {
      publication?.verdictCid &&
      <Suspense fallback={<VerdictCardSkeleton />}>
        <VerdictCard
          verdictCid={publication.verdictCid}
          status={publication.status}
        />
      </Suspense>
    }

    {
      rootCid &&
      <Suspense fallback={<ManifestCardSkeleton />}>
        <ManifestCard
          rootCid={rootCid}
          status={publication.status}
        />
      </Suspense>
    }
  </div>)
}