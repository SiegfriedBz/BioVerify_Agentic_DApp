
import { TypographyH4, TypographyP, TypographySmall } from "@/app/_components/typography"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { FC } from "react"

type Props = {
  label: string
  value: string | number
  icon: LucideIcon
  description?: string
  status?: "default" | "warning" | "error"
}

export const MetricCard: FC<Props> = (props) => {
  const {
    label,
    value,
    icon: Icon,
    description,
    status = "default"
  } = props

  const statusClasses = {
    default: "border-border hover:ring-primary/20",
    warning: "border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20",
    error: "border-destructive/50 bg-destructive/5 ring-1 ring-destructive/20"
  }

  return (
    <Card className={cn("transition-all shadow-sm", statusClasses[status])}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between pb-3">
          <TypographySmall className={cn(
            "font-bold uppercase tracking-widest",
            status === "warning" ? "text-amber-600" : status === "error" ? "text-destructive" : "text-muted-foreground"
          )}>
            {label}
          </TypographySmall>
          <div className={cn(
            "rounded-full p-2",
            status === "warning" ? "bg-amber-500/20" : status === "error" ? "bg-destructive/20" : "bg-primary/10"
          )}>
            <Icon className={cn(
              "h-5 w-5",
              status === "warning" ? "text-amber-600" : status === "error" ? "text-destructive" : "text-primary"
            )} />
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