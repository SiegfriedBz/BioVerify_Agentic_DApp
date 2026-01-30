"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { FC } from "react";
import {
	FormProvider,
	type SubmitHandler,
	useFieldArray,
	useForm,
} from "react-hook-form";
import { toast } from "sonner";
import { AuthorRoleSchema } from "@/app/_schemas/author";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import {
	PublicationFormSchema,
	type PublicationFormT,
} from "../../_schemas/publication-form-schema";
import { AbstractInput } from "./abstract-input";
import { AddAuthorButton } from "./author-add-button";
import { AuthorInput } from "./author-input";
import { AddFileButton } from "./file-add-button";
import { FileInput } from "./file-input";
import { LicenseInput } from "./license-input";
import { ManuscriptInput } from "./manuscript-input";
import { TitleInput } from "./title-input";

const DEFAULT_VALUES = {
	title: "",
	abstract: "",
	manuscript: "",
	authors: [
		{
			name: "",
			role: AuthorRoleSchema.enum.First_Author,
		},
	],
	files: [],
};

export const PublicationForm: FC = () => {
	const form = useForm<PublicationFormT>({
		resolver: zodResolver(PublicationFormSchema),
		defaultValues: DEFAULT_VALUES,
	});

	// 1. Array for Authors
	const {
		fields: authorFields,
		append: appendAuthor,
		remove: removeAuthor,
	} = useFieldArray({
		control: form.control,
		name: "authors",
	});

	// 2. Array for Files
	const {
		fields: fileFields,
		append: appendFile,
		remove: removeFile,
	} = useFieldArray({
		control: form.control,
		name: "files",
	});

	const onSubmit: SubmitHandler<PublicationFormT> = async (data) => {
		// 1. Submit to IPFS
		const { createAndPinManifestRootCid } = await import(
			"@/app/api/pinata/create-and-pin-manifest-root-cid"
		);

		const rootCid = await createAndPinManifestRootCid(data);

		if (!rootCid) {
			toast.error("Something went wrong while uploading files to IPFS.");
			return;
		}

		console.log("rootCid", rootCid);

		toast.success("Files uploaded & pinned successfully to IPFS.");

		// TODO Submit to BioVerify
		// 3. Submit to BioVerify

		console.log("Submitting to BioVerify:", data);
	};

	return (
		<Card className="w-full max-w-3xl mx-auto my-10">
			<CardHeader>
				<CardTitle>Submit Research Publication</CardTitle>
				<CardDescription>
					Scientific data will be pre-validated via AI before on-chain
					submission.
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
							<TitleInput />
							<AbstractInput />
							<LicenseInput />

							{/* Dynamic Authors Section */}
							<div className="space-y-4 pt-4">
								<div className="flex items-center justify-between">
									<FieldLabel className="text-base">Authors</FieldLabel>
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

							{/* Manuscript Content */}
							<ManuscriptInput />

							{/* Dynamic Files Section */}
							<div className="space-y-4 pt-4 border-t">
								<div className="flex items-center justify-between">
									<FieldLabel className="text-base">
										Supporting Evidence (Data/Images)
									</FieldLabel>
									<AddFileButton
										onAddFile={() =>
											appendFile({ name: "", type: "data", file: null })
										}
									/>

									{fileFields.map((item, index) => {
										return (
											<FileInput
												key={item.id}
												index={index}
												onRemoveFile={() => removeFile(index)}
											/>
										);
									})}
								</div>
							</div>
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
					className="bg-primary text-primary-foreground"
				>
					{" "}
					Analyze) & Publish;
				</Button>
			</CardFooter>
		</Card>
	);
};
