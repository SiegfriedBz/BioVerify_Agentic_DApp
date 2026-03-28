"use client"

import { reownConfig } from "@/_config/wagmi/wagmi-config"
import { useSubmitPublication } from "@/_hooks/cqrs/commands/use-submit-publication"
import { useEffectiveSubmissionFee } from "@/_hooks/use-effective-submission-fee"
import { useNetwork } from "@/_hooks/use-network"
import { NetworkBadge, NetworkToMessage } from "@/app/_components/network-badge"
import { TypographySmall } from "@/app/_components/typography"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { AuthorRoleSchema, NetworkSchema, NetworkT } from "@packages/schema"
import { NetworkToChainId } from "@packages/utils"
import { switchChain } from "@wagmi/core"
import { Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { FC, useCallback } from "react"
import { FormProvider, SubmitHandler, useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { parseEther } from "viem"
import { pinManifest } from "../_api/pin-manifest"
import { SubmitPublicationFormSchema, SubmitPublicationFormT } from "../_schemas/submit-publication-form"
import { AbstractInput } from "./abstract-input"
import { AddAuthorButton } from "./add-author-button"
import { AddFileButton } from "./add-file-button"
import { AuthorInput } from "./author-input"
import { FeeCalculator } from "./fee-calculator"
import { FileInput } from "./file-input"
import { LicenseInput } from "./license-input"
import { ManuscriptInput } from "./manuscript-input"
import { StakeAmountInput } from "./stake-amount-input"
import { TitleInput } from "./title-input"

const DEFAULT_VALUES = {
	title: "",
	abstract: "",
	manuscript: "",
	authors: [
		{
			name: "",
			role: AuthorRoleSchema.enum.First_Author,
			wallet: {
				address: "0x...",
				network: NetworkSchema.enum.base_sepolia,
			},
		},
	],
	files: [],
	stakeAmount: "",
}

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
	const { mutateAsync, isPending: isTransactionPending } = useSubmitPublication()

	const router = useRouter()

	const form = useForm<SubmitPublicationFormT>({
		resolver: zodResolver(SubmitPublicationFormSchema),
		defaultValues: DEFAULT_VALUES,
		mode: "onChange" // for real-time FeeCalculator updates
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

	const onSubmit: SubmitHandler<SubmitPublicationFormT> = useCallback(
		async (data: SubmitPublicationFormT) => {
			try {
				// 1. IPFS Upload
				const rootCid = await pinManifest(data)
				if (!rootCid) {
					toast.error("Pinning the Manifest to IPFS failed")
					return
				}

				// 2. Blockchain Transaction
				const totalWeiValueSent = parseEther(data.stakeAmount) + effectiveSubmissionFeeWei

				await mutateAsync({
					cid: rootCid,
					totalWeiValue: totalWeiValueSent,
					submissionFeeWeiValue: effectiveSubmissionFeeWei
				})

				// 3. Success -> Redirect
				setTimeout(() => { router.push("/dashboard") }, 1_500)
			} catch (e) {
				// Error handled by mutation hook's onError
				console.error("Form submission error:", e)
			}
		},
		[mutateAsync, effectiveSubmissionFeeWei, router],
	)

	return (
		<FormProvider {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}
				className="grid grid-cols-1 @4xl:grid-cols-5 gap-8 items-start"
			>

				{/* Left Column: The Input Sections */}
				<div className="@4xl:col-span-3 space-y-6">
					<Card className="border-border shadow-sm">
						<CardContent className="py-6 space-y-8">
							<section className="space-y-4">
								<TypographySmall className="font-bold uppercase tracking-widest text-primary">1. Core Metadata *</TypographySmall>
								<TitleInput />
								<AbstractInput />
							</section>

							<section className="space-y-4 pt-6 border-t border-border/50">
								<TypographySmall className="font-bold uppercase tracking-widest text-primary">2. Research Body</TypographySmall>
								<ManuscriptInput />
								<LicenseInput />
							</section>

							<section className="space-y-4 pt-6 border-t border-border/50">
								<div className="flex justify-between items-center">
									<TypographySmall className="font-bold uppercase tracking-widest text-primary">3. Contributors *</TypographySmall>
									<AddAuthorButton onAddAuthor={() => appendAuthor({ name: "", role: "First_Author" })} />
								</div>
								{authorFields.map((field, index) => (
									<AuthorInput
										key={field.id}
										index={index}
										onRemoveAuthor={() => removeAuthor(index)}
									/>
								))}
							</section>

							<section className="space-y-4 pt-6 border-t border-border/50">
								<div className="flex justify-between items-center">
									<TypographySmall className="font-bold uppercase tracking-widest text-primary">4. Data</TypographySmall>
									<AddFileButton
										onAddFile={() =>
											appendFile({ name: "", type: "data", file: null })
										}
									/>
								</div>
								{fileFields.map((item, index) => {
									return (
										<FileInput
											key={item.id}
											index={index}
											onRemoveFile={() => removeFile(index)}
										/>
									)
								})}
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
					<FeeCalculator
						userStakeInput={stakeAmount}
						minStakeWei={parseEther(publisherStake)}
						effectiveFeeWei={effectiveSubmissionFeeWei || 0n}
					/>

					<Card className="border-border/50 bg-muted/20">
						<CardContent className="pt-0 space-y-4">
							<NetworkBadge network={targetNetwork} />
							{isWrongNetwork ? (
								<Button
									type="button"
									onClick={() => switchChain(reownConfig, { chainId: NetworkToChainId[targetNetwork] })}
									variant="destructive"
									className="cursor-pointer self-end"
								>
									Switch Wallet to {NetworkToMessage[targetNetwork]}
								</Button>
							) : (
								<Button
									type="submit"
									disabled={isDisabled}
									className={cn("w-full h-12 font-bold cursor-pointer", isDisabled && "cursor-not-allowed")}
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
							)}

							<TypographySmall className="text-center block text-muted-foreground px-4">
								By submitting, you agree to the protocol's slashing conditions for fraudulent data.
							</TypographySmall>
						</CardContent>
					</Card>
				</aside>

			</form>
		</FormProvider>
	)
}
