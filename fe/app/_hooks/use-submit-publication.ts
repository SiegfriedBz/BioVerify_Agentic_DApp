"use client";

import { useCallback } from "react";
import { parseEther } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useContractConfig } from "./use-contract-config";

type SubmitPublicationParams = {
	cid: string;
	ethValue: string;
};

export const useSubmitPublication = () => {
	const { data: hash, error, isPending, writeContract } = useWriteContract();
	const { isLoading: isConfirming, isSuccess: isConfirmed } =
		useWaitForTransactionReceipt({
			hash,
		});

	const contractConfig = useContractConfig();

	const submitPublication = useCallback(
		(params: SubmitPublicationParams) => {
			const { cid, ethValue } = params;

			const weiValue = parseEther(ethValue);

			return writeContract({
				...contractConfig,
				functionName: "submitPublication",
				args: [cid],
				value: weiValue,
			});
		},
		[writeContract, contractConfig],
	);

	return {
		submitPublication,
		hash,
		error,
		isPending,
		isConfirming,
		isConfirmed,
	};
};
