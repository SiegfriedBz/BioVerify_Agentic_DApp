import type { FC } from "react"
import { cn } from "@/lib/utils"

type Props = {
	isSeniorReviewer: boolean
}

export const ReviewerRoleBadge: FC<Props> = (props) => {
	const { isSeniorReviewer } = props

	return (
		<span
			className={cn(
				"inline-flex max-w-full items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
				isSeniorReviewer
					? "border-primary/20 bg-primary/10 text-primary shadow-[0_0_20px_rgba(76,214,255,0.12)]"
					: "border-border/50 bg-muted/25 text-muted-foreground",
			)}
		>
			<span
				className={cn(
					"h-1.5 w-1.5 shrink-0 rounded-full",
					isSeniorReviewer
						? "bg-primary shadow-[0_0_10px_rgba(0,209,255,0.55)]"
						: "bg-secondary",
				)}
				aria-hidden
			/>
			<span>{isSeniorReviewer ? "Senior Reviewer" : "Peer Reviewer"}</span>
		</span>
	)
}
