import { env } from "@packages/env"
import { NetworkSchema, type NetworkT } from "@packages/schema"
import "server-only"

const BOT_TOKEN = env.TELEGRAM_BOT_TOKEN ?? ""
const CHAT_ID = env.TELEGRAM_CHAT_ID ?? ""

export const mask = (addr: string) =>
	`\`${addr.slice(0, 6)}...${addr.slice(-4)}\``
export const networkMessage = (network: NetworkT) => {
	return network === NetworkSchema.enum.base_sepolia
		? "Base Sepolia"
		: "Sepolia"
}

export const sendTelegramNotification = async (message: string) => {
	console.log(`TELEGRAM 📱 Broadcasting: ${message}`)

	if (!BOT_TOKEN || !CHAT_ID) {
		console.warn("⚠️ Telegram credentials missing. Check your .env")
		return
	}

	const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				chat_id: CHAT_ID,
				text: message,
				parse_mode: "Markdown",
			}),
		})

		if (!response.ok) {
			const errorData = await response.json()
			console.error("❌ Telegram API Error:", errorData)
		}
	} catch (error) {
		console.error("❌ Failed to send Telegram notification:", error)
	}

	return { success: true }
}
