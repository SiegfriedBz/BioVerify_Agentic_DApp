import { HeroImage } from "@/app/_components/hero-image"
import { HeroVideo } from "@/app/_components/hero-video"
import {
	TypographyH1,
	TypographyH2,
	TypographyH3,
	TypographyH4,
	TypographyP,
	TypographySmall,
} from "@/app/_components/typography"
import { VideoSkeleton } from "@/app/_components/video-skeleton"
import { Button } from "@/components/ui/button"
import {
	ArrowRight,
	DicesIcon,
	GavelIcon,
	LinkIcon,
	UsersRoundIcon,
} from "lucide-react"
import Link from "next/link"
import { Fragment, Suspense } from "react"

const STATUS_DOT = {
	sky: "bg-sky-400 shadow-[0_0_8px] shadow-sky-400/45",
	cyan: "bg-cyan-400 shadow-[0_0_8px] shadow-cyan-400/45",
	violet: "bg-violet-400 shadow-[0_0_8px] shadow-violet-400/45",
	emerald: "bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/45",
} as const

const protocolSteps = [
	{
		i: "01",
		title: "Staked Submission",
		desc: "Publishers upload a Research Manifest to IPFS and commit their CID + Stake on-chain. This triggers an Exa AI semantic scan to verify originality instantly.",
		icon: LinkIcon,
		tech: ["IPFS", "Base/Sepolia", "Alchemy Notify", "LangGraph", "Exa AI"],
		status: "Integrity Verified",
		statusDot: "sky" as const,
	},
	{
		i: "02",
		title: "Trustless Selection",
		desc: "Chainlink VRF selects peers from the staked reviewer pool. The highest-reputation member is appointed Senior Reviewer to oversee the consensus flow if required.",
		icon: DicesIcon,
		tech: ["Chainlink VRF", "LangGraph"],
		status: "VRF Finalized",
		statusDot: "cyan" as const,
	},
	{
		i: "03",
		title: "Human Consensus",
		desc: "Selected peers evaluate the submitted publication and sign EIP-712 verdicts. The AI agent analyzes the off-chain signed payloads for consensus.",
		icon: UsersRoundIcon,
		tech: ["HITL", "EIP-712", "LangGraph"],
		status: "EIP-712 Signed",
		statusDot: "violet" as const,
	},
	{
		i: "04",
		title: "Final Settlement",
		desc: "If peer verdicts conflict, the AI triggers an escalation state. The Senior Reviewer submits the golden truth to break the tie and settle stakes (ETH + reputation).",
		icon: GavelIcon,
		tech: ["HITL", "LangGraph"],
		status: "Stake Settled",
		statusDot: "emerald" as const,
		incentive: "ETH + reputation rewards for publisher and reviewers",
	},
]

export default function Page() {
	return (
		<main className="flex w-full max-w-full grow flex-col items-center pb-16 lg:pb-24">
			<section className="flex w-full max-w-6xl min-h-[calc(100svh-4rem)] flex-col items-center gap-4 px-4 pt-10 pb-6 text-center sm:gap-6 sm:px-6 md:flex-row md:items-center md:gap-10 md:pt-16 md:text-left lg:gap-12 lg:pt-24">
				<div className="flex min-w-0 flex-col items-center gap-4 md:flex-1 md:items-start md:gap-6">
					<TypographySmall className="flex items-center gap-x-1.5 rounded-full bg-primary/15 px-3 py-1.5 uppercase tracking-widest text-primary">
						<span
							className="size-2 shrink-0 animate-pulse rounded-full bg-primary shadow-[0_0_12px] shadow-secondary/50"
							aria-hidden
						/>
						DeSci Protocol Active
					</TypographySmall>

					<p className="text-sm font-semibold tracking-tight text-primary/90 md:text-base">
						BioVerify V3
					</p>

					<TypographyH1 className="max-w-4xl text-4xl md:text-5xl lg:text-6xl">
						Trustless Peer Review at AI Speed.
					</TypographyH1>

					<TypographyP className="mt-0 max-w-2xl text-base text-muted-foreground md:text-lg md:leading-relaxed">
						Scientific Decentralization through Agentic Consensus.
					</TypographyP>

					<div className="mt-0 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center md:justify-start">
						<Button
							asChild
							size="lg"
							className="min-h-11 w-full bg-linear-to-br from-primary to-[#00d1ff] text-primary-foreground shadow-lg shadow-[#0e141b]/40 hover:opacity-95 sm:w-auto"
						>
							<Link href="/publications/new" className="gap-2">
								Submit Research
								<ArrowRight className="size-4" aria-hidden />
							</Link>
						</Button>
						<Button
							asChild
							variant="secondary"
							size="lg"
							className="min-h-11 w-full sm:w-auto"
						>
							<Link href="/publications">View Dashboard</Link>
						</Button>
					</div>
				</div>

				<div className="w-full min-w-0 max-md:flex max-md:flex-1 max-md:items-center md:mt-0 md:flex-1 md:min-w-0">
					<div className="block w-full pt-4 md:hidden">
						<HeroImage />
					</div>
					<div className="hidden w-full md:block">
						<Suspense fallback={<VideoSkeleton />}>
							<HeroVideo />
						</Suspense>
					</div>
				</div>
			</section>

			<section className="mt-16 w-full max-w-6xl px-4 sm:px-6 md:mt-28">
				<p className="text-center text-xs font-medium uppercase tracking-widest text-primary">
					Process Architecture
				</p>
				<TypographyP className="mx-auto mt-2 max-w-2xl text-pretty text-center text-sm leading-relaxed text-muted-foreground md:text-base md:leading-relaxed">
					A meritocratic peer-review pipeline leveraging LangGraph agents for
					forensic validation and Chainlink VRF for trustless reviewer
					selection.
				</TypographyP>
				<TypographyH2 className="mt-2 border-none pb-0 text-center md:mt-3">
					Protocol Mechanism
				</TypographyH2>

				<div className="mt-8 flex flex-col gap-0 md:mt-10 md:flex-row md:items-stretch md:gap-0">
					{protocolSteps.map((step, idx) => {
						const isLast = idx === protocolSteps.length - 1

						return (
							<Fragment key={step.i}>
								<div className="@container relative z-1 flex min-w-0 flex-1 flex-col rounded-lg bg-card p-5 md:p-4 lg:p-5">
									<div className="flex items-start justify-between gap-2">
										<span className="text-sm font-semibold tabular-nums text-primary [font-family:var(--font-space-grotesk),system-ui,sans-serif]">
											{step.i}
										</span>
										<div className="rounded-md bg-muted p-2">
											<step.icon
												className="size-5 text-primary @md:size-6"
												aria-hidden
											/>
										</div>
									</div>
									<TypographyH4 className="mb-2 mt-3 border-none text-base @md:text-lg @md:font-semibold">
										{step.title}
									</TypographyH4>
									<TypographyP className="mt-0 grow text-xs leading-relaxed text-muted-foreground @md:text-sm">
										{step.desc}
									</TypographyP>

									<ul
										className="mt-2 flex list-none flex-wrap gap-x-1 p-0"
										aria-label="Tech stack"
									>
										{step.tech.map((label) => (
											<li key={label}>
												<span className="inline-block rounded-sm border border-border/40 bg-muted/50 px-1 py-px text-[10px] font-normal leading-none tracking-wide text-muted-foreground">
													{label}
												</span>
											</li>
										))}
									</ul>

									{step.incentive ? (
										<p className="mt-2 rounded-sm border border-secondary/25 bg-secondary/10 px-2 py-1 text-[10px] font-medium leading-snug text-secondary">
											<span className="font-semibold uppercase tracking-wide text-secondary">
												Incentive —{" "}
											</span>
											{step.incentive}
										</p>
									) : null}

									<TypographySmall className="mt-3 flex items-center gap-2 rounded-sm bg-primary/10 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary lg:mt-4">
										<span
											className={`size-1.5 shrink-0 rounded-full ${STATUS_DOT[step.statusDot]}`}
											aria-hidden
										/>
										{step.status}
									</TypographySmall>
								</div>
								{!isLast ? (
									<>
										<div
											className="flex justify-center py-2 md:hidden"
											aria-hidden
										>
											<div className="h-6 w-px rounded-full bg-linear-to-b from-primary/15 via-secondary/40 to-primary/15" />
										</div>
										<div
											className="relative z-0 hidden w-4 shrink-0 self-center md:flex md:items-center md:pt-6"
											aria-hidden
										>
											<div className="h-0.5 w-full rounded-full bg-linear-to-r from-primary/25 via-secondary/50 to-primary/25" />
										</div>
									</>
								) : null}
							</Fragment>
						)
					})}
				</div>
			</section>

			<section className="mt-16 w-full self-stretch border-t border-border/40 bg-linear-to-r from-primary/8 via-card to-secondary/12 px-4 py-10 sm:px-6 md:mt-24 md:py-14">
				<div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:gap-10 md:text-left">
					<div className="min-w-0 md:max-w-xl">
						<p className="text-xs font-semibold uppercase tracking-widest text-primary">
							BioVerify Protocol
						</p>
						<TypographyH3 className="mt-2 border-none text-2xl md:text-3xl">
							Ready to submit verifiable research?
						</TypographyH3>
						<TypographyP className="mt-0 text-sm text-muted-foreground md:text-base">
							Stake, review, and anchor scientific outcomes with agentic
							consensus and on-chain provenance.
						</TypographyP>
					</div>
					<Button
						asChild
						size="lg"
						className="h-11 w-full shrink-0 bg-linear-to-br from-primary to-[#00d1ff] px-8 text-primary-foreground shadow-lg shadow-[#0e141b]/30 hover:opacity-95 md:w-auto"
					>
						<Link href="/publications" className="gap-2">
							Get Started
							<ArrowRight className="size-4" aria-hidden />
						</Link>
					</Button>
				</div>
			</section>
		</main>
	)
}
