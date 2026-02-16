import { getPublicationsMock } from "@/lib/protocol/get-publications"
import { ProtocolPublicationMapper } from "@/lib/protocol/mappers/protocol-publication-mapper"
import { FC } from "react"
import { PublicationsTable } from "./table/publications-table"

export const PublicationsTableContainer: FC = async () => {
  // TODO call getPublications after next solidty deployment
  const data = await getPublicationsMock()
  const publications = data.map(ProtocolPublicationMapper)

  return <PublicationsTable publications={publications} />
}