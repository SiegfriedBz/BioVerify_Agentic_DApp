"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { waitForTransactionReceipt, writeContract } from "@wagmi/core"
import { toast } from "sonner"
import { reownConfig } from "@/_config/wagmi/wagmi-config"
import { useContractConfig } from "../../use-contract-config"
import { publicationsKeys } from "../query-keys/publications-keys"

type PublicationArgs = {
	cid: string
	totalWeiValue: bigint
	submissionFeeWeiValue: bigint
}

export const useSubmitPublication = () => {
	const queryClient = useQueryClient()
	const contractConfig = useContractConfig()

	return useMutation({
		mutationFn: async (args: PublicationArgs) => {
			const { cid, totalWeiValue, submissionFeeWeiValue } = args

			// Trigger Wallet
			const hash = await writeContract(reownConfig, {
				...contractConfig,
				functionName: "submitPublication",
				args: [cid, submissionFeeWeiValue],
				value: totalWeiValue,
			})

			toast.info("Transaction sent! Waiting for confirmation...")

			// Wait for Mining
			const receipt = await waitForTransactionReceipt(reownConfig, { hash })

			if (receipt.status === "reverted") throw new Error("Transaction reverted")

			return receipt
		},
		onSuccess: async () => {
			toast.success("Publication confirmed on ledger!")

			// Schedule a background invalidation to ensure sync with the actual Neon DB
			setTimeout(() => {
				queryClient.invalidateQueries({ queryKey: publicationsKeys.all })
			}, 3000)
		},
		onError: (err: Error) => {
			const shortMessage = (err as { shortMessage?: string }).shortMessage
			const message =
				shortMessage || err.message || "Publication Submission failed"
			toast.error(message)
		},
	})
}
