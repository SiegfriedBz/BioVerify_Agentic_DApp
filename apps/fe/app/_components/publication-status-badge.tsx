import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
	type PublicationStatus,
	PublicationStatusSchema,
} from "@packages/schema"
import type { ComponentProps, FC } from "react"

const publicationStatusToColor: Record<PublicationStatus, string> = {
	[PublicationStatusSchema.enum.SUBMITTED]: "bg-blue-400",
	[PublicationStatusSchema.enum.IN_REVIEW]: "bg-fuchsia-400",
	[PublicationStatusSchema.enum.EARLY_SLASHED]: "bg-red-500",
	[PublicationStatusSchema.enum.SLASHED]: "bg-red-400",
	[PublicationStatusSchema.enum.PUBLISHED]:
		"bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]",
}

const publicationStatusToMessage: Record<PublicationStatus, string> = {
	[PublicationStatusSchema.enum.SUBMITTED]: "Submitted",
	[PublicationStatusSchema.enum.IN_REVIEW]: "In review",
	[PublicationStatusSchema.enum.EARLY_SLASHED]: "Early Slashed",
	[PublicationStatusSchema.enum.SLASHED]: "Slashed",
	[PublicationStatusSchema.enum.PUBLISHED]: "Published",
}

export const publicationStatusOptions = PublicationStatusSchema.options.map(
	(option) => {
		return {
			value: option,
			label: publicationStatusToMessage[option],
		}
	},
)

type Props = ComponentProps<typeof Badge> & {
	status: PublicationStatus
}
export const PublicationStatusBadge: FC<Props> = (props) => {
	const { status, className, ...rest } = props

	return (
		<Badge
			{...rest}
			variant={"ghost"}
			className={cn("flex items-center gap-x-2", className)}
		>
			<span
				className={cn("rounded-full size-2", publicationStatusToColor[status])}
			/>
			<span>{publicationStatusToMessage[status]}</span>
		</Badge>
	)
}
