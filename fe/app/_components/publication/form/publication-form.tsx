"use client"

import { useEffectiveSubmissionFee } from "@/app/_hooks/use-effective-submission-fee"
import { useSubmitPublication } from "@/app/_hooks/use-submit-publication"
import { AuthorRoleSchema } from "@/app/_schemas/author"
import { NetworkSchema } from "@/app/_schemas/wallet"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { zodResolver } from "@hookform/resolvers/zod"
import { type FC, useCallback, useEffect } from "react"
import {
	FormProvider,
	type SubmitHandler,
	useFieldArray,
	useForm,
} from "react-hook-form"
import { toast } from "sonner"
import { parseEther } from "viem"
import type { BaseError } from "wagmi"
import { AbstractInput } from "../inputs/abstract-input"
import { AddAuthorButton } from "../inputs/author-add-button"
import { AuthorInput } from "../inputs/author-input"
import { AddFileButton } from "../inputs/file-add-button"
import { FileInput } from "../inputs/file-input"
import { LicenseInput } from "../inputs/license-input"
import { ManuscriptInput } from "../inputs/manuscript-input"
import { SendValueInput } from "../inputs/send-value-input"
import { TitleInput } from "../inputs/title-input"
import {
	PublicationFormSchema,
	type PublicationFormT,
} from "./publication-form-schema"

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

export const PublicationForm: FC = () => {

	// TODO Add refresh effectiveSubmissionFee button
	const { effectiveSubmissionFeeWei } = useEffectiveSubmissionFee()

	const form = useForm<PublicationFormT>({
		resolver: zodResolver(PublicationFormSchema),
		defaultValues: DEFAULT_VALUES,
	})

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

	const onSubmit: SubmitHandler<PublicationFormT> = useCallback(
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
		<div className="flex flex-col gap-4 w-full max-w-3xl mx-auto my-10">
			<Card className="w-full max-w-3xl mx-auto my-10">
				<CardHeader>
					<CardTitle>Submit Research Publication</CardTitle>
					<CardDescription>
						Data hashes are anchored on-chain to trigger automated AI
						pre-validation and forensics.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<FormProvider {...form}>
						<form
							id="publication-form"
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-8"
						>
							<FieldGroup>
								{/* Title */}
								<TitleInput />

								{/* Dynamic Authors Section */}
								<div className="space-y-4 pt-4">
									<div className="flex items-center justify-between">
										<FieldLabel className="text-base">Authors *</FieldLabel>
										<AddAuthorButton
											onAddAuthor={() =>
												appendAuthor({
													name: "",
													role: AuthorRoleSchema.enum.First_Author,
												})
											}
										/>
									</div>

									{authorFields.map((field, index) => (
										<AuthorInput
											key={field.id}
											index={index}
											onRemoveAuthor={() => removeAuthor(index)}
										/>
									))}
								</div>

								{/* Abstract */}
								<AbstractInput />

								{/* Manuscript Content */}
								<ManuscriptInput />

								{/* License */}
								<LicenseInput />

								{/* Dynamic Files Section */}
								<div className="space-y-4 pt-4 border-t">
									<div className="flex flex-col items-center justify-between">
										<div className="flex justify-between w-full">
											<FieldLabel className="text-base">
												Files (Data/Images)
											</FieldLabel>
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
									</div>
								</div>

								{/* Staking Amount */}
								<SendValueInput effectiveSubmissionFeeWei={effectiveSubmissionFeeWei} />
							</FieldGroup>
						</form>
					</FormProvider>
				</CardContent>

				<CardFooter className="flex justify-between border-t p-6">
					<Button variant="outline" onClick={() => form.reset()}>
						Reset Form
					</Button>
					<Button
						type="submit"
						form="publication-form"
						className="bg-primary text-primary-foreground cursor-pointer"
						disabled={isPending || isConfirming}
					>
						{isPending ? (
							<div className="flex gap-x-2 items-center">
								<Spinner /> Publishing...
							</div>
						) : isConfirming ? (
							<div className="flex gap-x-2 items-center">
								<Spinner /> Confirming...
							</div>
						) : (
							<span>Publish</span>
						)}
					</Button>
				</CardFooter>
			</Card>
		</div>
	)
}
