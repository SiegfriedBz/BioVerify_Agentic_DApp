import { z } from "zod"

/** * Defines the types of interrupts that pause the graph for human action.
 */
export enum InterruptKind {
	REVIEW_PUBLICATION = "REVIEW_PUBLICATION",
	SENIOR_REVIEW_PUBLICATION = "SENIOR_REVIEW_PUBLICATION",
}

/** * Outcomes allowed for human and AI agents.
 */
export const HumanDecisionSchema = z.enum(["pass", "fail"])
export type HumanDecision = z.infer<typeof HumanDecisionSchema>

export const LlmDecisionSchema = z.enum(["pass", "fail", "pending", "escalate"])

/** * Verdicts combine a decision with a justification reason.
 */
export const HumanVerdictSchema = z.object({
	decision: HumanDecisionSchema,
	reason: z.string(),
})

export const LlmVerdictSchema = z.object({
	decision: LlmDecisionSchema,
	reason: z.string(),
})
export type LlmVerdict = z.infer<typeof LlmVerdictSchema>

/** * HumanReview represents a reviewer's address and their optional verdict.
 */
export const HumanReviewSchema = z.object({
	address: z.string(),
	verdict: HumanVerdictSchema.optional(),
})
export type HumanReview = z.infer<typeof HumanReviewSchema>

/** * HumanFullReview represents a reviewer who has completed their verdict.
 */
export const HumanFullReviewSchema = z.object({
	address: z.string(),
	verdict: HumanVerdictSchema,
})
export type HumanFullReview = z.infer<typeof HumanFullReviewSchema>
