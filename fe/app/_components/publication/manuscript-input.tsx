"use client";

import type { FC } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";

export const ManuscriptInput: FC = () => {
	const { control } = useFormContext();

	return (
		<Controller
			name="manuscript"
			control={control}
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
					<FieldDescription>Min. 100 characters required.</FieldDescription>
					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</Field>
			)}
		/>
	);
};
