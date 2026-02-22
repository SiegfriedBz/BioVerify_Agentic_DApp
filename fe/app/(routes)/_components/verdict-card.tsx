
import { PublicationStatusBadge } from "@/app/_components/publication-status-badge"
import { TypographyH3 } from "@/app/_components/typography"
import { ProtocolPublicationStatus } from "@/app/_schemas/schemas/contract/protocol-publication"
import { fetchIpfs } from "@/app/api/pinata/fetch-ipfs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { FingerprintIcon } from "lucide-react"
import { FC } from "react"

type Props = {
  verdictCid: string
  status: ProtocolPublicationStatus
}

export const VerdictCard: FC<Props> = async (props: Props) => {
  const { verdictCid, status } = props

  if (!verdictCid) return null

  // Fetching verdict
  const data = await fetchIpfs(verdictCid)
  const verdict: string = await data.text()

  return (
    <Card className="overflow-hidden border-border bg-card shadow-sm">
      <CardHeader className="bg-muted/30 pb-8 space-y-4">
        <div className="flex justify-between items-start gap-6">
          <TypographyH3 className="text-2xl font-serif tracking-tight leading-snug mt-0!">
            Verdict
          </TypographyH3>
          <PublicationStatusBadge status={status} />
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground bg-background/50 px-3 py-1.5 rounded-md border border-border w-fit shadow-sm">
          <FingerprintIcon className="w-3 h-3 text-primary/60" />
          <span className="truncate max-w-50 @lg:max-w-none">{verdictCid}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-8 space-y-10">
        <section className="space-y-3">
          <p className="text-lg leading-relaxed text-foreground/90 italic font-serif border-l-2 border-primary/20 pl-6 py-1">
            {verdict}
          </p>
        </section>
      </CardContent>
    </Card>
  )
}