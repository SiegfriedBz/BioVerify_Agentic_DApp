"use client"

/**
 * @title ReviewForm
 * @notice Provides a secure interface for reviewers to submit their technical validation of a research publication.
 * @dev This component implements the EIP-712 signing flow to authenticate human reviews before they are
 * injected into the LangGraph state machine. It handles:
 * 1. Form validation via Zod & React Hook Form.
 * 2. Cryptographic signing of the verdict (Decision + Reason + Metadata).
 * 3. Triggering the server-side LangGraph resumption (resumeReviewersAgent or resumeSeniorReviewerAgent).
 */

import { usePublicationDetailContext } from "@/_hooks/context/use-publication-details-ctx"
import { useSubmitReview } from "@/_hooks/cqrs/commands/use-submit-review"
import { useAuthFromWallet } from "@/_hooks/use-auth-from-wallet"
import { TypographySmall } from "@/app/_components/typography"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group"
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldGroup } from "@/components/ui/field"
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { HumanDecisionSchema } from "@packages/schema"
import { ChainIdToNetwork } from "@packages/utils"
import {
	AlertCircle,
	CheckCircle2,
	CheckCircle2Icon,
	SendIcon,
	XCircleIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { type FC, startTransition, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type { Address } from "viem"
import * as z from "zod"

const formSchema = z.object({
	decision: z.enum(["pass", "fail"]),
	reason: z.string().min(12, "Justification must be at least 12 characters."),
})

type formSchemaT = z.infer<typeof formSchema>

type SubmitStage = "idle" | "wallet" | "agent"

type StepState = "complete" | "active" | "pending"

function SubmitProgressRail(props: { stage: SubmitStage }) {
	const { stage } = props

	// While submitting, verdict is already filled — step 1 stays complete.
	const step1: StepState = "complete"
	const step2: StepState =
		stage === "wallet" ? "active" : stage === "agent" ? "complete" : "active"
	const step3: StepState = stage === "agent" ? "active" : "pending"

	const steps: Array<{ label: string; state: StepState }> = [
		{ label: "Fill Verdict", state: step1 },
		{ label: "Sign Wallet", state: step2 },
		{ label: "Agent Verifying", state: step3 },
	]

	return (
		<div
			className="grid w-full grid-cols-1 gap-3 pt-1 @sm:grid-cols-3"
			aria-live="polite"
		>
			{steps.map((step) => (
				<div key={step.label} className="flex items-center gap-2">
					<span
						className={cn(
							"size-1.5 shrink-0 rounded-full",
							step.state === "active" && "animate-pulse bg-primary",
							step.state === "complete" && "bg-secondary",
							step.state === "pending" && "bg-muted",
						)}
						aria-hidden
					/>
					<TypographySmall
						className={cn(
							"text-[10px] font-medium uppercase tracking-tight",
							step.state === "active" && "text-foreground",
							step.state === "complete" && "text-secondary",
							step.state === "pending" && "text-muted-foreground/70",
						)}
					>
						{step.label}
					</TypographySmall>
				</div>
			))}
		</div>
	)
}

export const ReviewForm: FC = () => {
	const router = useRouter()
	const [stage, setStage] = useState<SubmitStage>("idle")

	const form = useForm<formSchemaT>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			decision: HumanDecisionSchema.enum.fail,
			reason: "",
		},
	})

	const { publication } = usePublicationDetailContext()
	const { walletAddress, walletChainId } = useAuthFromWallet()

	const { mutateAsync, isPending } = useSubmitReview()

	const userAddr = walletAddress?.toLowerCase()

	const isSeniorReviewer = useMemo(() => {
		return (
			publication?.seniorReviewer?.toLowerCase() ===
			walletAddress?.toLowerCase()
		)
	}, [publication, walletAddress])

	const hasReviewed = Boolean(
		userAddr && publication?.reviewersStatus[userAddr as Address],
	)

	const totalPeerReviews = publication
		? Object.keys(publication.reviewersStatus).filter((addr) =>
			publication.reviewers.some(
				(r) => r.toLowerCase() === addr.toLowerCase(),
			),
		).length
		: 0

	const peerCount = publication?.reviewers.length ?? 0
	const isSeniorStandby =
		isSeniorReviewer && peerCount > 0 && totalPeerReviews < peerCount

	const submitDisabled = isPending || isSeniorStandby

	const onSubmit = async (data: formSchemaT) => {
		if (
			!publication?.cid ||
			!publication.chainId ||
			!publication.seniorReviewer
		) {
			return toast.error("Publication not found.")
		}

		if (!walletAddress || !walletChainId)
			return toast.error("Connect wallet first")

		if (walletChainId !== publication.chainId) {
			return toast.error(
				`Switch to ${ChainIdToNetwork[publication.chainId as number]} to submit`,
			)
		}

		setStage("wallet")
		try {
			await mutateAsync({
				decision: data.decision,
				reason: data.reason,
				reviewer: walletAddress,
				publication: {
					pubId: Number(publication.pubId),
					cid: publication.cid,
					chainId: publication.chainId,
					seniorReviewer: publication.seniorReviewer,
				},
				onSigned: () => setStage("agent"),
			})

			setTimeout(() => {
				startTransition(() => {
					router.push("/publications/assignments")
				})
			}, 2_500)
		} catch (_err) {
			toast.error("Review Submission flow interrupted")
		} finally {
			setStage("idle")
		}
	}

	if (hasReviewed && publication) {
		return (
			<Card className="overflow-hidden border-border shadow-md">
				<CardContent className="p-6">
					<Alert className="border-secondary/20 bg-secondary/10 text-secondary [&>svg]:text-secondary">
						<CheckCircle2 className="size-4" />
						<AlertTitle>Verdict Recorded</AlertTitle>
						<AlertDescription className="text-muted-foreground">
							Your review for Pub #{publication.pubId} has been transmitted to
							the AI Agent.
						</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		)
	}



	return (
		<Card className="overflow-hidden border-border shadow-md">
			<CardHeader className="border-b bg-muted/30 pb-4">
				<CardTitle>
					<TypographySmall className="font-bold uppercase tracking-widest text-primary">
						Verdict
					</TypographySmall>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6 p-6">
				{isSeniorStandby && (
					<Alert className="border-l-4 border-tertiary bg-tertiary/15 text-tertiary dark:text-tertiary [&>svg]:text-tertiary">
						<AlertCircle className="size-5" />
						<AlertTitle className="font-semibold">Awaiting peer reviews</AlertTitle>
						<AlertDescription className="text-foreground/80">
							Submission opens once all peers have submitted. Your input will
							only be required if the AI Agent detects conflicting verdicts
							among peer reviewers.
						</AlertDescription>
					</Alert>
				)}
				<form id="form-review" onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup>
						<section className="space-y-3">
							<TypographySmall className="font-bold uppercase tracking-widest text-muted-foreground/80">
								1. Decision
							</TypographySmall>
							<Controller
								name="decision"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field
										data-invalid={fieldState.invalid}
										className="space-y-3"
									>
										<ToggleGroup
											type="single"
											value={field.value}
											className="grid grid-cols-2 gap-4"
											onValueChange={(v) => v && field.onChange(v)}
										>
											<ToggleGroupItem
												value={HumanDecisionSchema.enum.pass}
												className="flex h-20 flex-col gap-2 border-2 data-[state=on]:border-primary data-[state=on]:bg-primary/5"
											>
												<CheckCircle2Icon className="h-5 w-5 text-secondary" />
												<span className="text-xs font-bold uppercase">
													Valid
												</span>
											</ToggleGroupItem>
											<ToggleGroupItem
												value={HumanDecisionSchema.enum.fail}
												className="flex h-20 flex-col gap-2 border-2 data-[state=on]:border-error data-[state=on]:bg-error/5"
											>
												<XCircleIcon className="h-5 w-5 text-error" />
												<span className="text-xs font-bold uppercase">
													Invalid
												</span>
											</ToggleGroupItem>
										</ToggleGroup>
									</Field>
								)}
							/>
						</section>

						<section className="space-y-3 border-t border-border/50 pt-4">
							<TypographySmall className="font-bold uppercase tracking-widest text-muted-foreground/80">
								2. Justification
							</TypographySmall>
							<Controller
								name="reason"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field
										data-invalid={fieldState.invalid}
										className="space-y-3"
									>
										<InputGroup>
											<InputGroupTextarea
												{...field}
												id="reason"
												placeholder="Provide technical feedback for the author..."
												rows={6}
												className="min-h-30 resize-none bg-muted/20"
												aria-invalid={fieldState.invalid}
											/>
										</InputGroup>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
						</section>
					</FieldGroup>
				</form>
			</CardContent>

			<CardFooter className="flex flex-col gap-2">
				<ButtonGroup className="w-full">
					<Button
						type="button"
						variant="outline"
						onClick={() => form.reset()}
						className="h-12 cursor-pointer"
						disabled={isPending}
					>
						Reset
					</Button>
					<ButtonGroupSeparator />
					<Button
						type="submit"
						form="form-review"
						className="h-12 grow cursor-pointer border-0 bg-[linear-gradient(135deg,#a4e6ff_0%,#00d1ff_100%)] font-bold uppercase tracking-tight text-[#003543] shadow-[0_4px_20px_rgba(0,209,255,0.18)] transition-[filter,box-shadow] hover:brightness-110 hover:shadow-[0_6px_24px_rgba(0,209,255,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
						disabled={submitDisabled}
					>
						<SendIcon className="mr-2 h-4 w-4" />
						Sign &amp; Submit
					</Button>
				</ButtonGroup>
				{isPending && <SubmitProgressRail stage={stage} />}
				<p className="w-full text-center text-xs leading-relaxed text-muted-foreground">
					Gasless submission — You sign the verdict. Our AI Agent handles the
					transaction and fees.
				</p>
			</CardFooter>
		</Card>
	)
}
