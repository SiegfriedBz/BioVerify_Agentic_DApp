import { Publication } from "@packages/schema"
import { FC, PropsWithChildren } from "react"
import { PublicationHeader } from "./publication-header"

type Props = {
  publication: Publication
  isSyncing: boolean
}

export const PublicationMainContent: FC<PropsWithChildren<Props>> = props => {
  const { publication, isSyncing, children } = props

  return (
    <div className="@5xl:col-span-2 space-y-8" >
      <PublicationHeader
        publication={publication}
        isSyncing={isSyncing}
      />
      {children}
    </div>
  )
}