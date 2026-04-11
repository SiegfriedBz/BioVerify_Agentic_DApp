import {
	type PublicationStatus,
	PublicationStatusSchema,
} from "@packages/schema"
import type { ComponentProps, FC } from "react"
import { cn } from "@/lib/utils"

const statusConfig: Record<
	PublicationStatus,
	{ badge: string; dot: string; label: string }
> = {
	[PublicationStatusSchema.enum.SUBMITTED]: {
		badge: "bg-primary/10 text-primary",
		dot: "bg-primary shadow-[0_0_8px_#4cd6ff]",
		label: "Submitted",
	},
	[PublicationStatusSchema.enum.IN_REVIEW]: {
		badge: "bg-tertiary/10 text-tertiary",
		dot: "bg-tertiary",
		label: "In Review",
	},
	[PublicationStatusSchema.enum.EARLY_SLASHED]: {
		badge: "bg-error/10 text-error",
		dot: "bg-error",
		label: "Early Slashed",
	},
	[PublicationStatusSchema.enum.SLASHED]: {
		badge: "bg-error/10 text-error/60",
		dot: "bg-error/60",
		label: "Slashed",
	},
	[PublicationStatusSchema.enum.PUBLISHED]: {
		badge: "bg-secondary/10 text-secondary",
		dot: "bg-secondary shadow-[0_0_8px_#71d7cd]",
		label: "Published",
	},
}

export const publicationStatusOptions = PublicationStatusSchema.options.map(
	(option) => ({
		value: option,
		label: statusConfig[option].label,
	}),
)

type Props = ComponentProps<"span"> & {
	status: PublicationStatus
}

export const PublicationStatusBadge: FC<Props> = (props) => {
	const { status, className, ...rest } = props
	const { badge, dot, label } = statusConfig[status]

	return (
		<span
			{...rest}
			className={cn(
				"inline-flex items-center gap-1.5 rounded-sm px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
				badge,
				className,
			)}
		>
			<span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dot)} />
			{label}
		</span>
	)
}
