import { Badge } from "@/components/ui/badge"
import { ProtocolPublicationStatus, ProtocolPublicationStatusSchema } from "@/lib/protocol/schemas/protocol-publication"
import { FC } from "react"

export const statusLabel: Record<ProtocolPublicationStatus, string> = {
  [ProtocolPublicationStatusSchema.enum.SUBMITTED]: "Submitted",
  [ProtocolPublicationStatusSchema.enum.IN_REVIEW]: "In Review",
  [ProtocolPublicationStatusSchema.enum.PUBLISHED]: "Published",
  [ProtocolPublicationStatusSchema.enum.SLASHED]: "Slashed",
}

const statusVariants: Record<ProtocolPublicationStatus, string> = {
  [ProtocolPublicationStatusSchema.enum.SUBMITTED]: "secondary",
  [ProtocolPublicationStatusSchema.enum.IN_REVIEW]: "warning",
  [ProtocolPublicationStatusSchema.enum.PUBLISHED]: "default",
  [ProtocolPublicationStatusSchema.enum.SLASHED]: "destructive",
}

type Props = {
  status: ProtocolPublicationStatus
}
export const StatusBadge: FC<Props> = (props) => {
  const { status } = props

  return <Badge variant={statusVariants[status] as any}>{statusLabel[status]}</Badge>
}