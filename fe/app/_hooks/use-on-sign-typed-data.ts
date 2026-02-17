"use client"

/**
 * @title useOnSignTypeData
 * @notice A specialized hook for generating EIP-712 compliant signatures for peer review verdicts.
 * @dev This hook abstracts the `useSignTypedData` wagmi hook, enforcing the BioVerify 
 * 'HumanReview' type schema. It ensures that the reviewer's intent is cryptographically 
 * bound to a specific publication and IPFS root CID.
 */

import { useCallback } from "react"
import { useSignTypedData } from "wagmi"
import { SignTypedDataVariables } from "wagmi/query"
import z from "zod"

/** * @dev Enum representing the valid outcomes of a human review session. 
 */
export const HumanDecisionSchema = z.enum(["pass", "fail"])
export type HumanDecision = z.infer<typeof HumanDecisionSchema>

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
  /** @dev The on-chain ID of the publication being reviewed. */
  publicationId: string
  /** @dev The IPFS Content Identifier of the research manifest being validated. */
  rootCid: string
  /** @dev Callback executed upon successful wallet signature. */
  onSuccess: (signature: `0x${string}`, variables: SignTypedDataVariables, context: unknown) => void
}

export const useOnSignTypeData = (params: Params) => {
  const { publicationId, rootCid, onSuccess } = params
  const signTypedData = useSignTypedData()

  /**
   * @notice Triggers the wallet's signing prompt with structured EIP-712 data.
   * @dev The message field names must match the HUMAN_REVIEW_TYPES exactly for the 
   * signature to be valid during recovery on the server/contract.
   */
  const signTd = useCallback((params: SignDataParams) => {
    const {
      reviewer,
      decision,
      reason,
    } = params

    signTypedData.mutate({
      types: HUMAN_REVIEW_TYPES,
      primaryType: 'HumanReview',
      message: {
        reviewer,
        publicationId,
        rootCid,
        decision,
        reason
      },
    }, { onSuccess })
  }, [publicationId, rootCid, onSuccess, signTypedData])

  return { signTd }
}

/**
 * @dev EIP-712 Typed Data Schema.
 * @notice This structure defines how the "Sign Message" prompt appears in the user's wallet.
 * Any change here requires a corresponding change in the server-side verification logic.
 */
const HUMAN_REVIEW_TYPES = {
  HumanReview: [
    { name: 'reviewer', type: 'address' },
    { name: 'publicationId', type: 'string' },
    { name: 'rootCid', type: 'string' },
    { name: 'decision', type: 'string' },
    { name: 'reason', type: 'string' },
  ],
} as const