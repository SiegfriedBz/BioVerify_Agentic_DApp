"use client";

import type { FC } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export const TitleInput: FC = () => {
	const { control } = useFormContext();

	return (
		<Controller
			name="title"
			control={control}
			render={({ field, fieldState }) => (
				<Field data-invalid={fieldState.invalid}>
					<FieldLabel>Title</FieldLabel>
					<Input {...field} placeholder="Enter your research title..." />
					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</Field>
			)}
		/>
	);
};
