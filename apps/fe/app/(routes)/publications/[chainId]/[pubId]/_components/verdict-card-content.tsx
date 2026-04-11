"use client"

import { TypographyH3 } from "@/app/_components/typography"
import { VerdictCardSkeleton } from "@/app/_components/verdict-card-skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { fetchIpfs } from "@packages/utils"
import { useQuery } from "@tanstack/react-query"
import { FingerprintIcon } from "lucide-react"
import type { FC } from "react"

type Props = {
	verdictCid: string
	initialVerdict?: string
}

export const VerdictCardContent: FC<Props> = (props) => {
	const { verdictCid, initialVerdict } = props

	const { data: verdict, isFetching } = useQuery({
		queryKey: ["verdict", verdictCid],
		queryFn: async () => {
			const res = await fetchIpfs(verdictCid)
			return res.text()
		},
		initialData: initialVerdict,
		enabled: !!verdictCid,
	})

	if (isFetching && !verdict) return <VerdictCardSkeleton />

	if (!verdict) return null

	return (
		<Card className="overflow-hidden border-border bg-card shadow-sm">
			<CardHeader className="bg-muted/30 pb-8 space-y-4">
				<div className="flex justify-between items-start gap-6">
					<TypographyH3 className="text-2xl tracking-tight leading-snug mt-0!">
						Verdict
					</TypographyH3>
				</div>

				<div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground bg-background/50 px-3 py-1.5 rounded-md border border-border/30 w-fit shadow-sm">
					<FingerprintIcon className="w-3 h-3 text-primary/60" />
					<span className="truncate max-w-50 @lg:max-w-none">
						IPFS {verdictCid}
					</span>
				</div>
			</CardHeader>

			<CardContent className="pt-4 space-y-8">
				<section className="space-y-3">
					<p className="text-lg leading-relaxed text-foreground/90 italic font-serif border-l-2 border-primary/20 pl-6 py-1">
						{verdict}
					</p>
				</section>
			</CardContent>
		</Card>
	)
}
