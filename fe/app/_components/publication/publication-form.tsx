"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileUp, Plus, Trash2, UserPlus } from "lucide-react";
import type { FC } from "react";
import {
	Controller,
	type SubmitHandler,
	useFieldArray,
	useForm,
} from "react-hook-form";
import { AuthorRoleSchema } from "@/app/_schemas/author";
import { NetworkSchema } from "@/app/_schemas/wallet";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import {
	FileTypeSchema,
	PublicationFormSchema,
	type PublicationFormT,
} from "./publication-form-schema";

export const PublicationForm: FC = () => {
	const form = useForm<PublicationFormT>({
		resolver: zodResolver(PublicationFormSchema),
		defaultValues: {
			title: "",
			abstract: "",
			manuscript: "",
			license: "CC-BY-4.0",
			authors: [
				{
					name: "",
					role: AuthorRoleSchema.enum.First_Author,
				},
			],
			files: [],
		},
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
		// TODO Submit to IPFS
		// TODO Submit to BioVerify
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
				<form
					id="publication-form"
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-8"
				>
					<FieldGroup>
						{/* Title */}
						<Controller
							name="title"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Title</FieldLabel>
									<Input
										{...field}
										placeholder="Enter your research title..."
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						{/* Abstract */}
						<Controller
							name="abstract"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Abstract</FieldLabel>
									<Textarea
										{...field}
										placeholder="Enter your research summary..."
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						{/* License */}
						<Controller
							name="license"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>License</FieldLabel>
									<Input
										{...field}
										placeholder="Enter your research license..."
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						{/* Dynamic Authors Section */}
						<div className="space-y-4 pt-4">
							<div className="flex items-center justify-between">
								<FieldLabel className="text-base">Authors</FieldLabel>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() =>
										appendAuthor({
											name: "",
											role: AuthorRoleSchema.enum.First_Author,
										})
									}
								>
									<UserPlus className="mr-2 h-4 w-4" /> Add Author
								</Button>
							</div>

							{authorFields.map((field, index) => (
								<div key={field.id} className="flex gap-4 items-start">
									<div className="flex-1">
										<Controller
											name={`authors.${index}.name`}
											control={form.control}
											render={({ field, fieldState }) => (
												<Field data-invalid={fieldState.invalid}>
													<Input {...field} placeholder="Full Name" />
													{fieldState.invalid && (
														<FieldError errors={[fieldState.error]} />
													)}
												</Field>
											)}
										/>
									</div>
									<div className="flex-1">
										<Controller
											name={`authors.${index}.role`}
											control={form.control}
											render={({ field }) => (
												<select
													{...field}
													className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-sm"
												>
													<option value={AuthorRoleSchema.enum.First_Author}>
														First Author
													</option>
													<option value={AuthorRoleSchema.enum.Contributor}>
														Contributor
													</option>
												</select>
											)}
										/>
									</div>
									<div className="flex-1">
										<Controller
											name={`authors.${index}.wallet.address`}
											control={form.control}
											render={({ field }) => (
												<Input
													{...field}
													placeholder="Wallet (0x... or sei1...)"
												/>
											)}
										/>
									</div>

									<div className="flex-1">
										<Controller
											name={`authors.${index}.wallet.network`}
											control={form.control}
											render={({ field }) => (
												<select
													{...field}
													className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-sm"
												>
													<option value={NetworkSchema.enum.sei_testnet}>
														Sei testnet
													</option>
													<option value={NetworkSchema.enum.sei_mainnet}>
														Sei mainnet
													</option>
													<option value={NetworkSchema.enum.sepolia}>
														Sepolia
													</option>
													<option value={NetworkSchema.enum.ethereum}>
														Ethereum
													</option>
												</select>
											)}
										/>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => removeAuthor(index)}
										className="text-destructive"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							))}
						</div>

						{/* Manuscript Content */}
						<Controller
							name="manuscript"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Manuscript (Markdown or Text)</FieldLabel>
									<InputGroup>
										<InputGroupTextarea
											{...field}
											placeholder="Paste your full paper content here..."
											rows={10}
										/>
									</InputGroup>
									<FieldDescription>
										Min. 100 characters for scientific depth.
									</FieldDescription>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						{/* Dynamic Files Section */}
						<div className="space-y-4 pt-4 border-t">
							<div className="flex items-center justify-between">
								<FieldLabel className="text-base">
									Supporting Evidence (Data/Images)
								</FieldLabel>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() =>
										appendFile({ name: "", type: "data", file: null })
									}
								>
									<Plus className="mr-2 h-4 w-4" /> Add Component
								</Button>
							</div>

							{fileFields.map((item, index) => (
								<div
									key={item.id}
									className="grid grid-cols-12 gap-3 p-4 bg-muted/20 rounded-lg border items-center"
								>
									<div className="col-span-5">
										<Controller
											name={`files.${index}.name`}
											control={form.control}
											render={({ field }) => (
												<Input
													{...field}
													placeholder="Component Name"
													size={16}
												/>
											)}
										/>
									</div>
									<div className="col-span-3">
										<Controller
											name={`files.${index}.type`}
											control={form.control}
											render={({ field }) => (
												<select
													{...field}
													className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-sm"
												>
													<option value={FileTypeSchema.enum.data}>Data</option>
													<option value={FileTypeSchema.enum.image}>
														Image
													</option>
													<option value={FileTypeSchema.enum.code}>Code</option>
												</select>
											)}
										/>
									</div>
									<div className="col-span-3">
										<Controller
											name={`files.${index}.file`}
											control={form.control}
											render={({ field: { onChange }, fieldState }) => (
												<Field data-invalid={fieldState.invalid}>
													<label className="cursor-pointer flex items-center justify-center h-9 w-full rounded-md border border-dashed border-primary/50 hover:bg-primary/5">
														<FileUp className="h-4 w-4 mr-2" />
														<span className="text-[10px] truncate">Upload</span>
														<input
															type="file"
															className="hidden"
															onChange={(e) => onChange(e.target.files?.[0])}
														/>
													</label>
												</Field>
											)}
										/>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => removeFile(index)}
										className="col-span-1 text-destructive"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							))}
						</div>
					</FieldGroup>
				</form>
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
					Analyze & Publish
				</Button>
			</CardFooter>
		</Card>
	);
};
