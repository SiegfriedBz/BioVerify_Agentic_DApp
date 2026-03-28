
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Manifest } from "@packages/schema"
import { fetchIpfs } from "@packages/utils"
import { FileTextIcon, FingerprintIcon } from "lucide-react"
import { FC } from "react"
import { TypographyH3, TypographyP, TypographySmall } from "./typography"

type Props = {
  rootCid: string
}

export const ManifestCardWrapper: FC<Props> = async ({ rootCid }) => {
  if (!rootCid) return null

  // Fetching main manifest and individual parts
  const data = await fetchIpfs(rootCid)
  const manifest: Manifest = await data.json()

  const [title, abstract, manuscript] = await Promise.all([
    fetchIpfs(manifest.payload.titleCid).then(r => r.text()),
    fetchIpfs(manifest.payload.abstractCid).then(r => r.text()),
    fetchIpfs(manifest.payload.manuscriptCid).then(r => r.text()),
  ])

  return (
    <Card className="overflow-hidden border-border bg-card shadow-sm">
      <CardHeader className="bg-muted/30 pb-8 space-y-4">
        <div className="flex justify-between items-start gap-6">
          <TypographyH3 className="text-2xl font-serif tracking-tight leading-snug mt-0!">
            {title}
          </TypographyH3>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground bg-background/50 px-3 py-1.5 rounded-md border border-border w-fit shadow-sm">
          <FingerprintIcon className="w-3 h-3 text-primary/60" />
          <span className="truncate max-w-50 @lg:max-w-none">{rootCid}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-8 space-y-10">
        <section className="space-y-3">
          <TypographySmall className="font-bold uppercase tracking-widest text-primary/80">
            Abstract
          </TypographySmall>
          <p className="text-lg leading-relaxed text-foreground/90 italic font-serif border-l-2 border-primary/20 pl-6 py-1">
            {abstract}
          </p>
        </section>

        <Separator className="bg-border/60" />

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <FileTextIcon className="w-4 h-4 text-muted-foreground" />
            <TypographySmall className="font-bold uppercase tracking-widest">
              Manuscript Preview
            </TypographySmall>
          </div>

          <div className="bg-muted/10 p-6 rounded-xl border border-border/50 prose prose-sm max-w-none dark:prose-invert">
            <TypographyP className="whitespace-pre-wrap font-sans leading-relaxed text-foreground/80">
              {manuscript.length > 800 ? `${manuscript.slice(0, 800)}...` : manuscript}
            </TypographyP>
          </div>
        </section>
      </CardContent>
    </Card>
  )
}