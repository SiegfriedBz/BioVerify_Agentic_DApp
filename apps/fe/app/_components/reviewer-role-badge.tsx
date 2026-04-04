import type { ComponentProps, FC } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Props = ComponentProps<typeof Badge> & {
	isSeniorReviewer: boolean
}

export const ReviewerRoleBadge: FC<Props> = (props) => {
	const { isSeniorReviewer, className, ...rest } = props

	return (
		<Badge
			{...rest}
			variant={"ghost"}
			className={cn("flex items-center gap-x-2", className)}
		>
			<span
				className={cn(
					"rounded-full size-4",
					isSeniorReviewer ? "bg-amber-500" : "bg-blue-500",
				)}
			/>
			<span>{isSeniorReviewer ? "Senior" : "Peer"}</span>
		</Badge>
	)
}
