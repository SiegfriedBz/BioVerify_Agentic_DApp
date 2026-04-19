import Image from "next/image"
import type { FC } from "react"

export const HeroImage: FC = () => {
	return (
		<div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted/40 shadow-[0_20px_40px_rgba(14,20,27,0.4)]">
			<Image
				src="/images/hero-agentic-protocol.jpg"
				alt="BioVerify Agentic Protocol Workflow"
				fill
				className="object-cover"
				priority
				sizes="(max-width: 767px) 100vw, 55vw"
			/>
			<div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent" />
		</div>
	)
}
