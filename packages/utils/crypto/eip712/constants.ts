export const EIP712_PRIMARY_TYPE = 'HumanReview'

/**
 * @dev EIP-712 Typed Data Schema.
 * @notice This structure defines how the "Sign Message" prompt appears in the user's wallet.
 * Any change here requires a corresponding change in the server-side verification logic.
 */
export const EIP712_HUMAN_REVIEW_TYPES = {
  HumanReview: [
    { name: 'reviewer', type: 'address' },
    { name: 'publicationId', type: 'string' },
    { name: 'rootCid', type: 'string' },
    { name: 'decision', type: 'string' },
    { name: 'reason', type: 'string' },
  ],
} as const

