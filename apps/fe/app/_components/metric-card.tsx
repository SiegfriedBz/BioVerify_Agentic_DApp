import {
	TypographyH4,
	TypographyP,
	TypographySmall,
} from "@/app/_components/typography"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import type { FC } from "react"

type IconTone = "primary" | "secondary" | "error" | "warning"

type Props = {
	label: string
	value: string | number
	icon: LucideIcon
	description?: string
	/** Card + label emphasis for validation states (e.g. chain liquidity). */
	status?: "default" | "warning" | "error"
	/** Icon and icon circle only; card shell stays neutral unless `status` is warning/error. */
	iconTone?: IconTone
}

const iconToneClasses: Record<IconTone, { wrap: string; icon: string }> = {
	primary: { wrap: "bg-primary/10", icon: "text-primary" },
	secondary: { wrap: "bg-secondary/20", icon: "text-secondary" },
	error: { wrap: "bg-[var(--error)]/20", icon: "text-[var(--error)]" },
	warning: { wrap: "bg-amber-500/20", icon: "text-amber-600" },
}

export const MetricCard: FC<Props> = (props) => {
	const {
		label,
		value,
		icon: Icon,
		description,
		status = "default",
		iconTone: iconToneProp,
	} = props

	const cardStatusClasses = {
		default: "border-border hover:ring-primary/20",
		warning: "border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20",
		error: "border-destructive/50 bg-destructive/5 ring-1 ring-destructive/20",
	}

	const resolvedIconTone: IconTone =
		status === "warning"
			? "warning"
			: status === "error"
				? "error"
				: (iconToneProp ?? "primary")

	const { wrap: iconWrapClass, icon: iconClass } =
		iconToneClasses[resolvedIconTone]

	return (
		<Card className={cn("transition-all shadow-sm", cardStatusClasses[status])}>
			<CardContent className="p-6">
				<div className="flex items-center justify-between pb-3">
					<TypographySmall
						className={cn(
							"font-bold uppercase tracking-widest",
							status === "warning"
								? "text-amber-600"
								: status === "error"
									? "text-destructive"
									: "text-muted-foreground",
						)}
					>
						{label}
					</TypographySmall>
					<div className={cn("rounded-full p-2", iconWrapClass)}>
						<Icon className={cn("h-5 w-5", iconClass)} />
					</div>
				</div>

				<div className="flex flex-col gap-1">
					<div className="flex items-baseline gap-1">
						<TypographyH4 className="text-2xl font-mono font-bold tracking-tight text-foreground">
							{value}
						</TypographyH4>
					</div>

					{description && (
						<TypographyP className="mt-0! text-[10px] text-muted-foreground italic leading-tight">
							{description}
						</TypographyP>
					)}
				</div>
			</CardContent>
		</Card>
	)
}
