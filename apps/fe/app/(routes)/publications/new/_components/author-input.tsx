"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AuthorRoleSchema, NetworkSchema } from "@packages/schema"
import { AuthorRoleLabel, NetworkLabel } from "@packages/utils"
import { Trash2Icon } from "lucide-react"
import type { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"

const AUTHOR_ROLE_OPTIONS = AuthorRoleSchema.options.map((val) => {
	return {
		value: val,
		label: AuthorRoleLabel[val],
	}
})

const NETWORK_OPTIONS = NetworkSchema.options.map((val) => {
	return {
		value: val,
		label: NetworkLabel[val],
	}
})

type AuthorInputProps = {
	index: number
	onRemoveAuthor: () => void
}

export const AuthorInput: FC<AuthorInputProps> = (props) => {
	const { index, onRemoveAuthor } = props

	const { control } = useFormContext()

	return (
		<div className="flex w-full min-w-0 flex-col gap-3 rounded-lg border border-border/50 bg-muted/10 p-4 @md:flex-row @md:items-start @md:gap-3">
			<div className="min-w-0 w-full @md:flex-1">
				<Controller
					name={`authors.${index}.name`}
					control={control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<Input
								{...field}
								value={field.value ?? ""}
								placeholder="Full Name"
								className="w-full min-w-0"
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
			</div>

			<div className="min-w-0 w-full @md:flex-1">
				<Controller
					name={`authors.${index}.role`}
					control={control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<select
								{...field}
								className="flex h-9 w-full min-w-0 rounded-md border bg-background px-3 py-1 text-sm shadow-sm"
							>
								{AUTHOR_ROLE_OPTIONS.map((o) => {
									return (
										<option key={o.value} value={o.value}>
											{o.label}
										</option>
									)
								})}
							</select>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
			</div>

			<div className="min-w-0 w-full @md:flex-1">
				<Controller
					name={`authors.${index}.wallet.address`}
					control={control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<Input
								{...field}
								value={field.value ?? ""}
								placeholder="EVM wallet address (0x..., Base Sepolia or Sepolia ETH)"
								className="w-full min-w-0"
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
			</div>

			<div className="min-w-0 w-full @md:flex-1">
				<Controller
					name={`authors.${index}.wallet.network`}
					control={control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<select
								{...field}
								className="flex h-9 w-full min-w-0 rounded-md border bg-background px-3 py-1 text-sm shadow-sm"
							>
								{NETWORK_OPTIONS.map((o) => {
									return (
										<option key={o.value} value={o.value}>
											{o.label}
										</option>
									)
								})}
							</select>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
			</div>

			<Button
				variant="ghost"
				size="icon"
				onClick={onRemoveAuthor}
				className="shrink-0 self-end text-error @md:self-start"
				type="button"
			>
				<Trash2Icon className="h-4 w-4" />
			</Button>
		</div>
	)
}
