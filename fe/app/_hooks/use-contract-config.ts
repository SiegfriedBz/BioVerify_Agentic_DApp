"use client";

import { useMemo } from "react";
import {
	bioVerifyContractConfig,
	ContractChain,
	type ContractConfig,
} from "../_contracts/config";
import { useCurrentChain } from "./use-current-chain";

/**
 * @returns ContractConfig - BioVerify contract address & abi for current chain
 */
export const useContractConfig = (): ContractConfig => {
	const currentChain = useCurrentChain();

	return useMemo(() => {
		const isSepolia =
			currentChain?.name?.toUpperCase() === ContractChain.SEPOLIA;

		return bioVerifyContractConfig[
			isSepolia ? ContractChain.SEPOLIA : ContractChain.SEI_TESNET
		];
	}, [currentChain]);
};
