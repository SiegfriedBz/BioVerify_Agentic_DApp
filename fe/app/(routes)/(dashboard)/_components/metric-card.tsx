import { TypographyH4, TypographyP, TypographySmall } from "@/app/_components/typography"
import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { FC } from "react"

type MetricCardProps = {
  label: string
  value: string | number
  icon: LucideIcon
  description?: string
}

export const MetricCard: FC<MetricCardProps> = ({
  label,
  value,
  icon: Icon,
  description
}) => {
  return (
    <Card className="border-border bg-card shadow-sm transition-all hover:ring-1 hover:ring-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between pb-3">
          <TypographySmall className="font-bold uppercase tracking-widest text-muted-foreground">
            {label}
          </TypographySmall>
          <div className="rounded-full bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" />
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