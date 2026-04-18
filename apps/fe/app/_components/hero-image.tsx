import Image from "next/image"
import type { FC } from "react"

export const HeroImage: FC = () => {
	return (
		<div className="relative aspect-video max-h-138 w-full overflow-hidden rounded-lg bg-muted/40 shadow-[0_20px_40px_rgba(14,20,27,0.4)]">
			<Image
				src="/images/hero-agentic-protocol.png"
				alt="BioVerify Agentic Protocol Workflow"
				fill
				className="object-cover"
				priority
				sizes="(max-width: 1023px) 100vw, min(50vw, 36rem)"
			/>
			<div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent" />
		</div>
	)
}
