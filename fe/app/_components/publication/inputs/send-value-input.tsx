"use client";

import { type FC, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";
import { useContractConfig } from "@/app/_hooks/use-contract-config";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export const SendValueInput: FC = () => {
	const { control } = useFormContext();

	const contractConfig = useContractConfig();

	// Fetch Publication Submission Fee
	const { data: submissionFeeWei } = useReadContract({
		...contractConfig,
		functionName: "I_SUBMISSION_FEE",
	});

	// Fetch Publication Submission Minimum Stake
	const { data: minStakeWei } = useReadContract({
		...contractConfig,
		functionName: "I_MIN_STAKE",
	});

	const submissionFee = useMemo(
		() => (submissionFeeWei ? formatEther(submissionFeeWei as bigint) : ""),
		[submissionFeeWei],
	);

	const minStake = useMemo(
		() => (minStakeWei ? formatEther(minStakeWei as bigint) : ""),
		[minStakeWei],
	);

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
							Flat Submission Fee: {submissionFee} ETH
						</span>
					</FieldDescription>
					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</Field>
			)}
		/>
	);
};
