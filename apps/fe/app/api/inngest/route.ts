import { inngest } from "@/inngest/client"
import { reviewPublication } from "@/inngest/functions/review/review-publication"
import { auditComplete } from "@/inngest/functions/submission/audit-complete"
import { auditPublicationSubmission } from "@/inngest/functions/submission/audit-publication-submission"
import { serve } from "inngest/next"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    auditPublicationSubmission,
    auditComplete,
    reviewPublication
  ],
})
