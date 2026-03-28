import Image from "next/image"
import { FC } from "react"

export const HeroVisual: FC = () => {
  return (
    <div className="relative w-full aspect-video max-h-138 overflow-hidden rounded-xl border border-border shadow-2xl">
      <Image
        src="/images/hero-agentic-protocol.png"
        alt="BioVerify Agentic Protocol Workflow"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/10 to-transparent" />
    </div>
  )
}