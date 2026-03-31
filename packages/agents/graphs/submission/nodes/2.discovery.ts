import { env } from "@packages/env"
import 'server-only'
import type { SubmissionState } from "../state"

const EXA_BASE_URL = env.EXA_BASE_URL ?? "https://api.exa.ai/search"

export const discoveryNode = async (state: SubmissionState): Promise<Partial<SubmissionState>> => {
  const abstract = state.publication?.abstract
  if (!abstract) return { sources: [] }

  // We send the FULL abstract. Exa's neural engine handles the heavy lifting
  // of turning this into a high-dimensional vector for comparison.
  const res = await fetch(EXA_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.EXA_AI_API_KEY || ""
    },
    body: JSON.stringify({
      query: abstract,
      type: "neural",
      useAutoprompt: true,
      numResults: 5,
      // We explicitly request 'text' so the next node 
      // can compare the actual content for the final verdict.
      contents: {
        text: true
      },
      // Optional: narrows results to scholarly/academic domains
      category: "research paper"
    })
  })

  if (!res.ok) {
    // If rate-limited or down, throw so Inngest retries the step
    throw new Error(`Exa API Error: ${res.statusText} (${res.status})`)
  }

  const json = await res.json()

  // Map Exa's schema back to our internal 'sources' format
  const results = (json.results || []).map((result: any) => ({
    title: result.title || "Unknown Title",
    content: result.text || "",
    url: result.url,
    year: result.publishedDate ? new Date(result.publishedDate).getFullYear() : null,
    score: result.score || 0 // Exa's relevance score
  }))

  return { sources: results }
}