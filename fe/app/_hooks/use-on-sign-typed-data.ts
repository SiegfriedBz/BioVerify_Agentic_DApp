"use client"

/**
 * @title useOnSignTypeData
 * @notice A specialized hook for generating EIP-712 compliant signatures for peer review verdicts.
 * @dev This hook abstracts the `useSignTypedData` wagmi hook, enforcing the BioVerify 
 * 'HumanReview' type schema. It ensures that the reviewer's intent is cryptographically 
 * bound to a specific publication and IPFS root CID.
 */

import { EIP712_HUMAN_REVIEW_TYPES, EIP712_PRIMARY_TYPE } from "@/app/_utils/eip-712/constants"
import { getEip712Domain } from "@/app/_utils/eip-712/get-eip712-domain"
import { useCallback } from "react"
import { useSignTypedData } from "wagmi"
import { SignTypedDataVariables } from "wagmi/query"
import { HumanDecision } from "../_schemas/schemas/langchain/review"
import { NetworkT } from "../_schemas/schemas/network"

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
  network: NetworkT
  /** @dev The on-chain ID of the publication being reviewed. */
  publicationId: string
  /** @dev The IPFS Content Identifier of the research manifest being validated. */
  rootCid: string
  /** @dev Callback executed upon successful wallet signature. */
  onSuccess: (signature: `0x${string}`, variables: SignTypedDataVariables, context: unknown) => void
}

export const useOnSignTypeData = (params: Params) => {
  const { network, publicationId, rootCid, onSuccess } = params
  const signTypedData = useSignTypedData()

  /**
   * @notice Triggers the wallet's signing prompt with structured EIP-712 data.
   * @dev The message field names must match the EIP712_HUMAN_REVIEW_TYPES exactly for the 
   * signature to be valid during recovery on the server/contract.
   */
  const signTd = useCallback((params: SignDataParams) => {
    const {
      reviewer,
      decision,
      reason,
    } = params

    const domain = getEip712Domain(network)

    signTypedData.mutate({
      domain,
      types: EIP712_HUMAN_REVIEW_TYPES,
      primaryType: EIP712_PRIMARY_TYPE,
      message: {
        reviewer,
        publicationId,
        rootCid,
        decision,
        reason
      },
    }, { onSuccess })
  }, [publicationId, rootCid, onSuccess, signTypedData, network])

  return { signTd }
}
