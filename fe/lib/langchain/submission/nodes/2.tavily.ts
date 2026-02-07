'server-only'

import type { SubmissionState } from "../state"

const TAVILY_API_KEY = process.env.TAVILY_API_KEY ?? ""
const TAVILY_SEARCH_URL = process.env.TAVILY_SEARCH_URL ?? "https://api.tavily.com/search"

export const tavilyNode = async (state: SubmissionState): Promise<Partial<SubmissionState>> => {
	const abstract = state.publication?.abstract
	if (!abstract) return { sources: [] }

	// Use the first 200 characters as a literal search string
	const query = `"${abstract.slice(0, 200)}"`

	const res = await fetch(TAVILY_SEARCH_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			api_key: TAVILY_API_KEY,
			query,
			search_depth: "advanced",
			max_results: 5
		})
	})

	const { results } = await res.json()

	return { sources: results || [] }
}

