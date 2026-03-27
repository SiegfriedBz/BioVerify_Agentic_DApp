
import { PublicationDetailsProvider } from "@/_context/publication-details-provider"
import { getPublicationById } from "@packages/cqrs"
import { notFound } from "next/navigation"
import { FC } from "react"
import { ExecuteReviewWrapper } from "./execute-review-wrapper"
import { ReviewerGuard } from "./reviewer-guard"

type Props = { id: string } // chainId-pubId

export const ReviewerGuardWrapper: FC<Props> = async (props) => {
  const { id } = props

  const publication = await getPublicationById({ id })

  if (!publication) { return notFound() }

  return (
    <PublicationDetailsProvider initialPublication={publication}>
      <ReviewerGuard>
        <ExecuteReviewWrapper rootCid={publication.cid} />
      </ReviewerGuard>
    </PublicationDetailsProvider>
  )
}
