import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ComponentProps, FC } from "react"
import { ProtocolPublicationStatus, ProtocolPublicationStatusSchema } from "../_schemas/schemas/contract/protocol-publication"

const publicationStatusToColor: Record<ProtocolPublicationStatus, string> = {
  [ProtocolPublicationStatusSchema.enum.SUBMITTED]: "bg-blue-400",
  [ProtocolPublicationStatusSchema.enum.IN_REVIEW]: "bg-fuchsia-400",
  [ProtocolPublicationStatusSchema.enum.SLASHED]: "bg-red-400",
  [ProtocolPublicationStatusSchema.enum.PUBLISHED]: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]",
}

const publicationStatusToMessage: Record<ProtocolPublicationStatus, string> = {
  [ProtocolPublicationStatusSchema.enum.SUBMITTED]: "Submitted",
  [ProtocolPublicationStatusSchema.enum.IN_REVIEW]: "In review",
  [ProtocolPublicationStatusSchema.enum.SLASHED]: "Slashed",
  [ProtocolPublicationStatusSchema.enum.PUBLISHED]: "Published",
}

export const publicationStatusOptions = ProtocolPublicationStatusSchema.options.map(option => {
  return {
    value: option,
    label: publicationStatusToMessage[option]
  }
})

type Props = ComponentProps<typeof Badge> & {
  status: ProtocolPublicationStatus
}
export const PublicationStatusBadge: FC<Props> = (props) => {
  const { status, className, ...rest } = props

  return (
    <Badge
      {...rest}
      variant={"ghost"}
      className={cn("flex items-center gap-x-2", className)}>
      <span className={cn("rounded-full size-4",
        publicationStatusToColor[status]
      )} />
      <span>{publicationStatusToMessage[status]}</span>
    </Badge>
  )
}