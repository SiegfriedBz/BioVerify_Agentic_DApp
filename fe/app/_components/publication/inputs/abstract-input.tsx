"use client";

import type { FC } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

export const AbstractInput: FC = () => {
	const { control } = useFormContext();

	return (
		<Controller
			name="abstract"
			control={control}
			render={({ field, fieldState }) => (
				<Field data-invalid={fieldState.invalid}>
					<FieldLabel>Abstract *</FieldLabel>
					<Textarea {...field} placeholder="Enter your research summary..." />
					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</Field>
			)}
		/>
	);
};
