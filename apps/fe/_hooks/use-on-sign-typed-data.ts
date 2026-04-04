"use client"

import type { HumanDecision } from "@packages/schema"
import {
	ChainIdToNetwork,
	EIP712_HUMAN_REVIEW_TYPES,
	EIP712_PRIMARY_TYPE,
	getEip712Domain,
} from "@packages/utils"
import { useCallback } from "react"
import { useSignTypedData } from "wagmi"
import type { SignTypedDataVariables } from "wagmi/query"
import { usePublicationDetailContext } from "./context/use-publication-details-ctx"
import { useAuthFromWallet } from "./use-auth-from-wallet"

/**
 * @title useOnSignTypeData
 * @notice A specialized hook for generating EIP-712 compliant signatures for peer review verdicts.
 * @dev This hook abstracts the `useSignTypedData` wagmi hook, enforcing the BioVerify
 * 'HumanReview' type schema. It ensures that the reviewer's intent is cryptographically
 * bound to a specific publication and IPFS root CID.
 */

/**
 * @notice Input parameters for the signing function.
 * @param reviewer The checksummed Ethereum address of the reviewer.
 * @param decision The "pass"/"fail" verdict.
 * @param reason The technical justification provided by the reviewer.
 */
export type SignDataParams = {
	reviewer: `0x${string}`
	decision: HumanDecision
	reason: string
}

type Params = {
	onSuccess: (
		signature: `0x${string}`,
		variables: SignTypedDataVariables,
		context: unknown,
	) => void
}

export const useOnSignTypeData = (params: Params) => {
	const { onSuccess } = params
	const signTypedData = useSignTypedData()

	const { publication } = usePublicationDetailContext()
	const { walletAddress, walletChainId } = useAuthFromWallet()

	/**
	 * @notice Triggers the wallet's signing prompt with structured EIP-712 data.
	 * @dev The message field names must match the EIP712_HUMAN_REVIEW_TYPES exactly for the
	 * signature to be valid during recovery on the server/contract.
	 */
	const signTd = useCallback(
		(params: SignDataParams) => {
			const { reviewer, decision, reason } = params

			if (!walletChainId) return

			const domain = getEip712Domain(ChainIdToNetwork[walletChainId])

			const rootCid = publication?.cid
			const publicationId = publication?.pubId?.toString()

			if (
				!publicationId ||
				!rootCid ||
				!walletAddress ||
				!walletChainId ||
				walletChainId !== publication.chainId
			) {
				return
			}

			signTypedData.mutate(
				{
					domain,
					types: EIP712_HUMAN_REVIEW_TYPES,
					primaryType: EIP712_PRIMARY_TYPE,
					message: {
						reviewer,
						publicationId,
						rootCid,
						decision,
						reason,
					},
				},
				{ onSuccess },
			)
		},
		[publication, onSuccess, signTypedData, walletChainId, walletAddress],
	)

	return { signTd }
}
