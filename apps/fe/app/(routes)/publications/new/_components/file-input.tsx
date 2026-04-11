"use client"

import { FileTypeSchema } from "@packages/schema"
import { FileUpIcon, Trash2Icon } from "lucide-react"
import type { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Field, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type FileInputProps = {
	index: number
	onRemoveFile: () => void
}

export const FileInput: FC<FileInputProps> = (props) => {
	const { index, onRemoveFile } = props

	const { control } = useFormContext()

	return (
		<div className="flex w-full min-w-0 flex-col gap-3 rounded-lg border bg-muted/20 p-4 @lg:grid @lg:grid-cols-12 @lg:items-start @lg:gap-3">
			<div className="min-w-0 w-full @lg:col-span-5">
				<Controller
					name={`files.${index}.name`}
					control={control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<Input
								{...field}
								placeholder="Component Name"
								className="w-full min-w-0"
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
			</div>

			<div className="min-w-0 w-full @lg:col-span-3">
				<Controller
					name={`files.${index}.type`}
					control={control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<select
								{...field}
								className="flex h-9 w-full min-w-0 rounded-md border bg-background px-3 py-1 text-sm shadow-sm"
							>
								<option value={FileTypeSchema.enum.data}>Data</option>
								<option value={FileTypeSchema.enum.image}>Image</option>
								<option value={FileTypeSchema.enum.code}>Code</option>
							</select>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
			</div>

			<div className="min-w-0 w-full @lg:col-span-3">
				<Controller
					name={`files.${index}.file`}
					control={control}
					render={({ field: { onChange }, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<label className="flex h-9 w-full min-w-0 cursor-pointer items-center justify-center rounded-md border border-dashed border-primary/50 hover:bg-primary/5">
								<FileUpIcon className="mr-2 h-4 w-4 shrink-0" />
								<span className="truncate text-[10px]">Upload</span>
								<input
									type="file"
									className="hidden"
									onChange={(e) => onChange(e.target.files?.[0])}
								/>
							</label>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
			</div>

			<Button
				variant="ghost"
				size="icon"
				onClick={onRemoveFile}
				className="shrink-0 self-end text-error @lg:col-span-1 @lg:self-start"
				type="button"
			>
				<Trash2Icon className="h-4 w-4" />
			</Button>
		</div>
	)
}
