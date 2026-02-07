import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

const apiKey = process.env.GEMINI_API_KEY

const MODEL = "gemini-2.5-flash-lite"

type Params = {
	temperature?: number
}

export const createChatModel = (params: Params = {}) => {
	const { temperature = 0 } = params

	if (!apiKey) {
		throw new Error("NO ApiKey")
	}

	return new ChatGoogleGenerativeAI({
		apiKey,
		model: MODEL,
		temperature,
	})
}
