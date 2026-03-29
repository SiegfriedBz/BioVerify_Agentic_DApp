import { env } from "@packages/env"
import { BioVerifyInnGestEvents } from "@packages/schema"
import { Inngest } from "inngest"

const globalForInngest = globalThis as unknown as {
  inngest: Inngest<{
    id: string
    schemas: BioVerifyInnGestEvents,
  }> | undefined
}

export const inngest =
  globalForInngest.inngest ??
  new Inngest({
    id: "bioverify-app",
    schemas: {} as BioVerifyInnGestEvents,
    signingKey: env.INNGEST_SIGNING_KEY,
  })

if (process.env.NODE_ENV !== "production") {
  globalForInngest.inngest = inngest
}