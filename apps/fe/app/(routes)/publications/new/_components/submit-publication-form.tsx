"use client"

import { reownConfig } from "@/_config/wagmi/wagmi-config"
import { useSubmitPublication } from "@/_hooks/cqrs/commands/use-submit-publication"
import { useEffectiveSubmissionFee } from "@/_hooks/use-effective-submission-fee"
import { useNetwork } from "@/_hooks/use-network"
import { TypographySmall } from "@/app/_components/typography"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import {
	AuthorRoleSchema,
	NetworkSchema,
	type NetworkT,
} from "@packages/schema"
import { NetworkToChainId } from "@packages/utils"
import { switchChain } from "@wagmi/core"
import { Loader2Icon, ShieldCheckIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { type FC, useCallback } from "react"
import {
	type DefaultValues,
	FormProvider,
	type SubmitHandler,
	useFieldArray,
	useForm,
} from "react-hook-form"
import { toast } from "sonner"
import { parseEther } from "viem"
import { pinManifest } from "../_api/pin-manifest"
import {
	SubmitPublicationFormSchema,
	type SubmitPublicationFormT,
	type SubmitPublicationFormValues,
} from "../_schemas/submit-publication-form"
import { AbstractInput } from "./abstract-input"
import { AddAuthorButton } from "./add-author-button"
import { AddFileButton } from "./add-file-button"
import { AuthorInput } from "./author-input"
import { ChainContextCard } from "./chain-context-card"
import { FeeCalculator } from "./fee-calculator"
import { FileInput } from "./file-input"
import { LicenseInput } from "./license-input"
import { ManuscriptInput } from "./manuscript-input"
import { StakeAmountInput } from "./stake-amount-input"
import { TitleInput } from "./title-input"

const defaultAuthorWallet = (): NonNullable<
	SubmitPublicationFormValues["authors"][number]["wallet"]
> => ({
	address: "",
	network: NetworkSchema.enum.base_sepolia,
})

const DEFAULT_VALUES: DefaultValues<SubmitPublicationFormValues> = {
	title: "",
	abstract: "",
	manuscript: "",
	authors: [
		{
			name: "",
			role: AuthorRoleSchema.enum.First_Author,
			wallet: defaultAuthorWallet(),
		},
	],
	files: [],
	stakeAmount: "",
}

const emptyContributorAuthor =
	(): SubmitPublicationFormValues["authors"][number] => ({
		name: "",
		role: AuthorRoleSchema.enum.Contributor,
		wallet: defaultAuthorWallet(),
	})

type Props = {
	network: NetworkT
	publisherStake: string
}

export const SubmitPublicationForm: FC<Props> = (props) => {
	const { network: targetNetwork, publisherStake } = props

	// connectedNetwork comes from the Wallet
	const connectedNetwork = useNetwork()
	const isWrongNetwork = connectedNetwork !== targetNetwork

	const { effectiveSubmissionFeeWei } = useEffectiveSubmissionFee()
	const { mutateAsync, isPending: isTransactionPending } =
		useSubmitPublication()

	const router = useRouter()

	const form = useForm<SubmitPublicationFormValues>({
		resolver: zodResolver(SubmitPublicationFormSchema),
		defaultValues: DEFAULT_VALUES,
		mode: "onChange", // for real-time FeeCalculator updates
	})

	const stakeAmount = form.watch("stakeAmount")

	const isIpfsUploading = form.formState.isSubmitting
	const isDisabled = isTransactionPending || isIpfsUploading

	// 1. Array for Authors
	const {
		fields: authorFields,
		append: appendAuthor,
		remove: removeAuthor,
	} = useFieldArray({
		control: form.control,
		name: "authors",
	})

	// 2. Array for Files
	const {
		fields: fileFields,
		append: appendFile,
		remove: removeFile,
	} = useFieldArray({
		control: form.control,
		name: "files",
	})

	const onSubmit: SubmitHandler<SubmitPublicationFormValues> = useCallback(
		async (data) => {
			// zodResolver already validated; infer adds brands (e.g. `0x${string}`) on addresses.
			const payload = data as SubmitPublicationFormT
			try {
				// 1. IPFS Upload
				const rootCid = await pinManifest(payload)
				if (!rootCid) {
					toast.error("Pinning the Manifest to IPFS failed")
					return
				}

				// 2. Blockchain Transaction
				const totalWeiValueSent =
					parseEther(payload.stakeAmount) + effectiveSubmissionFeeWei

				await mutateAsync({
					cid: rootCid,
					totalWeiValue: totalWeiValueSent,
					submissionFeeWeiValue: effectiveSubmissionFeeWei,
				})

				// 3. Success -> Redirect
				setTimeout(() => {
					router.push("/dashboard")
				}, 1_500)
			} catch (e) {
				// Error handled by mutation hook's onError
				console.error("Form submission error:", e)
			}
		},
		[mutateAsync, effectiveSubmissionFeeWei, router],
	)

	return (
		<FormProvider {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="grid grid-cols-1 @4xl:grid-cols-5 gap-8 items-start"
			>
				{/* Left Column: The Input Sections */}
				<div className="@4xl:col-span-3 space-y-6">
					<Card className="border-border/40 bg-card/50 shadow-sm">
						<CardContent className="py-6 space-y-8">
							<section className="space-y-4">
								<TypographySmall className="font-bold uppercase tracking-widest text-primary">
									1. Core Metadata *
								</TypographySmall>
								<TitleInput />
								<AbstractInput />
							</section>

							<section className="space-y-4 pt-6 border-t border-border/50">
								<TypographySmall className="font-bold uppercase tracking-widest text-primary">
									2. Research Body
								</TypographySmall>
								<ManuscriptInput />
								<LicenseInput />
							</section>

							<section className="space-y-4 pt-6 border-t border-border/50">
								<div className="flex justify-between items-center">
									<TypographySmall className="font-bold uppercase tracking-widest text-primary">
										3. Contributors *
									</TypographySmall>
									<AddAuthorButton
										onAddAuthor={() => appendAuthor(emptyContributorAuthor())}
									/>
								</div>
								{form.formState.errors.authors?.message != null && (
									<FieldError>
										{String(form.formState.errors.authors.message)}
									</FieldError>
								)}
								<div className="flex w-full min-w-0 flex-col gap-4">
									{authorFields.map((field, index) => (
										<AuthorInput
											key={field.id}
											index={index}
											onRemoveAuthor={() => removeAuthor(index)}
										/>
									))}
								</div>
							</section>

							<section className="space-y-4 pt-6 border-t border-border/50">
								<div className="flex justify-between items-center">
									<TypographySmall className="font-bold uppercase tracking-widest text-primary">
										4. Data
									</TypographySmall>
									<AddFileButton
										onAddFile={() =>
											appendFile({ name: "", type: "data", file: null })
										}
									/>
								</div>
								{form.formState.errors.files?.message != null && (
									<FieldError>
										{String(form.formState.errors.files.message)}
									</FieldError>
								)}
								<div className="flex w-full min-w-0 flex-col gap-4">
									{fileFields.map((item, index) => {
										return (
											<FileInput
												key={item.id}
												index={index}
												onRemoveFile={() => removeFile(index)}
											/>
										)
									})}
								</div>
							</section>

							<section className="space-y-4 pt-6 border-t border-border/50">
								<TypographySmall className="font-bold uppercase tracking-widest text-primary">
									5. Protocol Economics
								</TypographySmall>
								<StakeAmountInput minStakeWei={parseEther(publisherStake)} />
							</section>
						</CardContent>
					</Card>
				</div>

				{/* Right Column: Sticky Submission Sidebar */}
				<aside className="@4xl:col-span-2 space-y-6 sticky top-8 h-fit">
					<ChainContextCard
						targetNetwork={targetNetwork}
						connectedNetwork={connectedNetwork}
						onSwitchChain={() =>
							switchChain(reownConfig, {
								chainId: NetworkToChainId[targetNetwork],
							})
						}
					/>
					<FeeCalculator
						userStakeInput={stakeAmount}
						minStakeWei={parseEther(publisherStake)}
						effectiveFeeWei={effectiveSubmissionFeeWei || 0n}
					/>

					<Card className="border-border/40 bg-card/50">
						<CardContent className="space-y-4 pt-0">
							<div className="flex items-start gap-3 rounded-lg border border-secondary/20 bg-secondary/10 px-3 py-2.5">
								<ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
								<div className="flex flex-col gap-0.5">
									<TypographySmall className="font-bold text-[10px] uppercase tracking-[0.15em] text-secondary">
										Stake Protection
									</TypographySmall>
									<TypographySmall className="text-[10px] leading-snug text-muted-foreground">
										Stake is returned upon successful verification by 3+
										independent nodes.
									</TypographySmall>
								</div>
							</div>

							<Button
								type="submit"
								disabled={isDisabled || isWrongNetwork}
								className={cn(
									"h-12 w-full cursor-pointer bg-primary font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90",
									(isDisabled || isWrongNetwork) &&
										"cursor-not-allowed opacity-60",
								)}
							>
								{isIpfsUploading ? (
									<>
										<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
										Uploading to IPFS...
									</>
								) : isTransactionPending ? (
									<>
										<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
										Confirming...
									</>
								) : (
									"Submit to Ledger"
								)}
							</Button>

							<TypographySmall className="block px-4 text-center text-muted-foreground">
								By submitting, you agree to the protocol's slashing conditions
								for fraudulent data.
							</TypographySmall>
						</CardContent>
					</Card>
				</aside>
			</form>
		</FormProvider>
	)
}
