"use client";

import { useMemo } from "react";
import type { Chain } from "viem";
import { useChainId, useChains } from "wagmi";

export const useCurrentChain = (): Chain | null => {
	const chains = useChains();
	const currentChainId = useChainId();

	const currentChain = useMemo(
		() => chains.find((chain) => chain.id === currentChainId),
		[chains, currentChainId],
	);

	return currentChain ?? null;
};
