import {
	BrainCircuitIcon,
	DnaIcon,
	ScaleIcon,
	ShieldCheckIcon,
} from "lucide-react"
import { Suspense } from "react"
import { HeroVideo } from "@/app/_components/hero-video"
import {
	TypographyH1,
	TypographyH2,
	TypographyH4,
	TypographyP,
	TypographySmall,
} from "@/app/_components/typography"
import { VideoSkeleton } from "@/app/_components/video-skeleton"
import { cn } from "@/lib/utils"

const protocolSteps = [
	{
		title: "1. Staked Submission",
		desc: "Publisher stakes tokens and submits the IPFS CID. A LangGraph agent immediately executes a Tavily-powered plagiarism check.",
		icon: ShieldCheckIcon,
		tag: "Automated",
	},
	{
		title: "2. VRF Selection",
		desc: "Chainlink VRF selects n peers trustlessly. The reviewer with the highest protocol reputation is designated as the Senior Reviewer.",
		icon: DnaIcon,
		tag: "On-Chain",
	},
	{
		title: "3. Peer Consensus",
		desc: "Selected peers evaluate the biological datasets and sign EIP-712 verdicts. The AI agent analyzes the signed payloads for consensus.",
		icon: BrainCircuitIcon,
		tag: "HITL",
	},
	{
		title: "4. AI Escalation",
		desc: "If peer verdicts conflict, the AI triggers an ESCALATE state. The Senior Reviewer submits the golden truth to break the tie and settle stakes.",
		icon: ScaleIcon,
		tag: "Meritocratic",
	},
]

export default function Page() {
	return (
		<main className="@container grow flex flex-col items-center justify-start pb-24">
			{/* Hero Section */}
			<section className="w-full max-w-6xl px-4 pt-4 @md:pt-24 flex flex-col items-center text-center gap-6">
				<TypographySmall className="text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
					DeSci Protocol v3
				</TypographySmall>

				<TypographyH1 className="max-w-4xl border-none">
					Decentralized Science, Secured by Agents and Human Consensus
				</TypographyH1>

				<TypographyP className="max-w-2xl text-muted-foreground text-lg @md:text-xl">
					A meritocratic peer-review pipeline leveraging LangGraph agents for
					forensic validation and Chainlink VRF for trustless reviewer
					selection.
				</TypographyP>

				<div className="w-full mt-8 @md:mt-12">
					<Suspense fallback={<VideoSkeleton />}>
						<HeroVideo />
					</Suspense>
				</div>
			</section>

			{/* Protocol Mechanics Section */}
			<section className="w-full max-w-6xl px-4 mt-24">
				<div className="text-center mb-12">
					<TypographyH2 className="border-none">
						Protocol Architecture
					</TypographyH2>
					<TypographyP className="text-muted-foreground">
						The Agentic Human-in-the-Loop (HITL) Verification Pipeline
					</TypographyP>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{protocolSteps.map((step) => (
						<div
							key={step.title}
							className={cn(
								"p-6 rounded-xl border border-border bg-card",
								"hover:border-primary/50 transition-colors group flex flex-col",
							)}
						>
							<div className="mb-6 flex items-center justify-between">
								<div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
									<step.icon className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
								</div>
								<TypographySmall className="bg-muted px-2 py-1 rounded-md text-[10px] text-muted-foreground">
									{step.tag}
								</TypographySmall>
							</div>
							<TypographyH4 className="mb-3">{step.title}</TypographyH4>
							<TypographyP className="text-muted-foreground text-sm leading-relaxed mt-0 grow">
								{step.desc}
							</TypographyP>
						</div>
					))}
				</div>
			</section>
		</main>
	)
}
