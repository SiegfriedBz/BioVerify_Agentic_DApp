"use client"

import { TypographySmall } from "@/app/_components/typography"
import { useEffectiveSubmissionFee } from "@/app/_hooks/use-effective-submission-fee"
import { useSubmitPublication } from "@/app/_hooks/use-submit-publication"
import { AuthorRoleSchema } from "@/app/_schemas/author"
import { NetworkSchema } from "@/app/_schemas/network"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { zodResolver } from "@hookform/resolvers/zod"
import { FC, useCallback, useEffect } from "react"
import { FormProvider, SubmitHandler, useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { parseEther } from "viem"
import { BaseError } from "wagmi"
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
				network: NetworkSchema.enum.sepolia,
			},
		},
	],
	files: [],
	stakeAmount: "",
}

type Props = {
	publisherMinStake: bigint
}

export const SubmitPublicationForm: FC<Props> = (props) => {
	const { publisherMinStake } = props

	const { effectiveSubmissionFeeWei } = useEffectiveSubmissionFee()

	const form = useForm<SubmitPublicationFormT>({
		resolver: zodResolver(SubmitPublicationFormSchema),
		defaultValues: DEFAULT_VALUES,
		mode: "onChange" // for real-time FeeCalculator updates
	})

	const stakeAmount = form.watch("stakeAmount")

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

	const { submitPublication, error, isPending, isConfirming, isConfirmed } =
		useSubmitPublication()

	const onSubmit: SubmitHandler<SubmitPublicationFormT> = useCallback(
		async (data) => {
			// 1. Submit to IPFS
			const { createAndPinManifestRootCid } = await import(
				"@/app/api/pinata/create-and-pin-manifest-root-cid"
			)

			const rootCid = await createAndPinManifestRootCid(data)

			if (!rootCid) {
				toast.error("Something went wrong while uploading files to IPFS.")
				return
			}

			toast.success("Files uploaded & pinned successfully to IPFS.")

			// 3. Submit to BioVerify
			console.log("Submitting to BioVerify:", data)
			const totalWeiValueSent = parseEther(data.stakeAmount) + effectiveSubmissionFeeWei
			submitPublication({ cid: rootCid, totalWeiValue: totalWeiValueSent, submissionFeeWeiValue: effectiveSubmissionFeeWei })
		},
		[submitPublication, effectiveSubmissionFeeWei],
	)

	useEffect(() => {
		if (error) {
			toast.error(
				<div>
					<span>Failed to publish on chain.</span>
					<span>
						Error: {(error as BaseError).shortMessage || error.message}
					</span>
					<span>Please try again</span>
				</div>,
			)
			return
		}

		if (isPending) {
			toast.info("Publishing on chain...")
			return
		}

		if (isConfirming) {
			toast.info("Waiting for transaction confirmation...")
			return
		}

		if (isConfirmed) {
			// form.reset();
			toast.success("Transaction confirmed.")
			return
		}
	}, [error, isPending, isConfirming, isConfirmed])

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
								<StakeAmountInput minStakeWei={publisherMinStake} />
							</section>
						</CardContent>
					</Card>
				</div>

				{/* Right Column: Sticky Submission Sidebar */}
				<aside className="@4xl:col-span-2 space-y-6 sticky top-8 h-fit">					<FeeCalculator
					userStakeInput={stakeAmount}
					minStakeWei={publisherMinStake}
					effectiveFeeWei={effectiveSubmissionFeeWei || 0n}
				/>

					<Card className="border-border/50 bg-muted/20">
						<CardContent className="pt-6 space-y-4">
							<Button
								type="submit"
								className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
								disabled={isPending || isConfirming}
							>
								{isPending ? "IPFS Uploading..." : isConfirming ? "Confirming..." : "Submit to Ledger"}
							</Button>
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