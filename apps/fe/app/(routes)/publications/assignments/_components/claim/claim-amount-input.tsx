"use client"

import { Coins } from "lucide-react"
import type { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type Props = {
	maxClaimEth: string
}

export const ClaimAmountInput: FC<Props> = (props) => {
	const { maxClaimEth } = props

	const { control } = useFormContext()

	return (
		<Controller
			name="amount"
			control={control}
			render={({ field, fieldState }) => (
				<Field
					data-invalid={fieldState.invalid}
					className="bg-primary/3 p-6 rounded-2xl border border-primary/10"
				>
					<div className="flex items-center gap-2 mb-2">
						<Coins className="h-4 w-4 text-primary" />
						<FieldLabel className="mb-0! font-bold uppercase tracking-tight text-xs">
							Claim (ETH)
						</FieldLabel>
					</div>

					<div className="relative">
						<Input
							{...field}
							type="text"
							inputMode="decimal"
							placeholder={maxClaimEth}
							className="h-12 text-lg font-mono bg-background border-primary/20 focus-visible:ring-primary/30 pl-4 pr-12"
						/>
						<div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
							ETH
						</div>
					</div>

					<FieldDescription className="mt-2 text-[10px] leading-tight text-muted-foreground/80">
						Maximum amount is <strong>{maxClaimEth} ETH</strong>. This amount is
						your current available stake locked in the protocol on this network.
					</FieldDescription>

					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</Field>
			)}
		/>
	)
}
