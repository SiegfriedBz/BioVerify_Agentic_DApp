import { ProtocolPublicationMapper } from "@/app/_schemas/mappers/protocol-publication-mapper"
import { getPublications } from "@/app/api/contract/get-publications"
import { FC } from "react"
import { PublicationsTable } from "./table/publications-table"

export const PublicationsTableContainer: FC = async () => {
  const data = await getPublications()
  const publications = data.map(ProtocolPublicationMapper)

  return <PublicationsTable publications={publications} />
}