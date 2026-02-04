"use client"

import { useContractConfig } from "@/app/_hooks/use-contract-config"
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { type FC, useMemo } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { formatEther } from "viem"
import { useReadContract } from "wagmi"

type Props = {
	effectiveSubmissionFeeWei: bigint
}

export const SendValueInput: FC<Props> = (props) => {
	const { effectiveSubmissionFeeWei } = props

	const { control } = useFormContext()
	const contractConfig = useContractConfig()

	// 2. Fetch Publication Submission Minimum Stake
	const { data: minStakeWei } = useReadContract({
		...contractConfig,
		functionName: "I_PUBLISHER_MIN_STAKE",
	})

	const minStake = useMemo(
		() => (minStakeWei ? formatEther(minStakeWei as bigint) : ""),
		[minStakeWei],
	)

	const submissionFee = useMemo(
		() => (effectiveSubmissionFeeWei ? formatEther(effectiveSubmissionFeeWei as bigint) : ""),
		[effectiveSubmissionFeeWei],
	)

	return (
		<Controller
			name="ethAmount"
			control={control}
			render={({ field, fieldState }) => (
				<Field data-invalid={fieldState.invalid}>
					<FieldLabel>Staking Amount (ETH) *</FieldLabel>
					<Input
						{...field}
						type="text"
						inputMode="decimal"
						min={minStake?.toString()}
						placeholder={minStake?.toString()}
					/>
					<FieldDescription className="flex flex-col gap-y-1">
						<span>Required Staking Amount (adding to Submission Fee).</span>
						<span className="text-sm italic">
							Dynamic Submission Fee based on network congestion: {submissionFee} ETH
						</span>
					</FieldDescription>
					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</Field>
			)}
		/>
	)
}

