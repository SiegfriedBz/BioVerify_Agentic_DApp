"use client"

import { FileTypeSchema } from "@/app/_schemas/publication"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { FileUpIcon, Trash2Icon } from "lucide-react"
import type { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"

type FileInputProps = {
	index: number
	onRemoveFile: () => void
}

export const FileInput: FC<FileInputProps> = (props) => {
	const { index, onRemoveFile } = props

	const { control } = useFormContext()

	return (
		<div className="grid grid-cols-12 gap-3 p-4 bg-muted/20 rounded-lg border items-center">
			<div className="col-span-5">
				<Controller
					name={`files.${index}.name`}
					control={control}
					render={({ field }) => (
						<Input {...field} placeholder="Component Name" size={16} />
					)}
				/>
			</div>

			<div className="col-span-3">
				<Controller
					name={`files.${index}.type`}
					control={control}
					render={({ field }) => (
						<select
							{...field}
							className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-sm"
						>
							<option value={FileTypeSchema.enum.data}>Data</option>
							<option value={FileTypeSchema.enum.image}>Image</option>
							<option value={FileTypeSchema.enum.code}>Code</option>
						</select>
					)}
				/>
			</div>
			<div className="col-span-3">
				<Controller
					name={`files.${index}.file`}
					control={control}
					render={({ field: { onChange }, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<label className="cursor-pointer flex items-center justify-center h-9 w-full rounded-md border border-dashed border-primary/50 hover:bg-primary/5">
								<FileUpIcon className="h-4 w-4 mr-2" />
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
				onClick={onRemoveFile}
				className="col-span-1 text-destructive"
			>
				<Trash2Icon className="h-4 w-4" />
			</Button>
		</div>
	)
}
