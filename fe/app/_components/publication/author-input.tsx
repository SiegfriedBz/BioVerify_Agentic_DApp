"use client";

import { Trash2Icon } from "lucide-react";
import type { FC } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { AuthorRoleSchema } from "@/app/_schemas/author";
import { NetworkSchema } from "@/app/_schemas/wallet";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type AuthorInputProps = {
	index: number;
	onRemoveAuthor: () => void;
};

export const AuthorInput: FC<AuthorInputProps> = (props) => {
	const { index, onRemoveAuthor } = props;

	const { control } = useFormContext();

	return (
		<div className="flex gap-4 items-start">
			{/* author name */}
			<div className="flex-1">
				<Controller
					name={`authors.${index}.name`}
					control={control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<Input {...field} placeholder="Full Name" />
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
			</div>

			{/* author role */}
			<div className="flex-1">
				<Controller
					name={`authors.${index}.role`}
					control={control}
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

			{/* author wallet address */}
			<div className="flex-1">
				<Controller
					name={`authors.${index}.wallet.address`}
					control={control}
					render={({ field }) => (
						<Input {...field} placeholder="Wallet (0x... or sei1...)" />
					)}
				/>
			</div>

			{/* author wallet network */}
			<div className="flex-1">
				<Controller
					name={`authors.${index}.wallet.network`}
					control={control}
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
							<option value={NetworkSchema.enum.sepolia}>Sepolia</option>
							<option value={NetworkSchema.enum.ethereum}>Ethereum</option>
						</select>
					)}
				/>
			</div>

			<Button
				variant="ghost"
				size="icon"
				onClick={onRemoveAuthor}
				className="text-destructive"
			>
				<Trash2Icon className="h-4 w-4" />
			</Button>
		</div>
	);
};
