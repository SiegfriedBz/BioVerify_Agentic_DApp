'server-only'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? ""
const CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? ""

export const sendTelegramNotification = async (message: string) => {
  console.log(`TELEGRAM 📱 Broadcasting: ${message}`)

  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn("⚠️ Telegram credentials missing. Check your .env")
    return
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
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