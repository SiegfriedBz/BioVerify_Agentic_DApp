import { NetworkSchema } from "@/app/_schemas/wallet"
import { startSubmissionAgent } from "@/lib/langchain/submission/agent"
import { waitUntil } from "@vercel/functions"
import { createHmac } from "node:crypto"
import { decodeEventLog, parseAbi } from "viem"

const abi = parseAbi([
	"event BioVerify_SubmitPublication(address indexed publisher, uint256 indexed pubId, string indexed cid)"
])

const SEPOLIA_SK = process.env.ALCHEMY_ETH_SEPOLIA_SubmittedPublication_WEBHOOK_SK
const SEI_SK = process.env.ALCHEMY_SEI_TESTNET_SubmittedPublication_WEBHOOK_SK

export async function POST(req: Request) {
	if (!SEPOLIA_SK && !SEI_SK) {
		console.error("❌ Critical: Webhook secrets are missing from environment.")
		return new Response("Configuration Error", { status: 500 })
	}

	try {
		const signature = req.headers.get("x-alchemy-signature")
		const rawBody = await req.text()

		if (!signature) return new Response("Missing signature", { status: 401 })

		// 1. Signature Verification (HMAC-SHA256)
		const isSepolia = SEPOLIA_SK &&
			createHmac("sha256", SEPOLIA_SK).update(rawBody).digest("hex") === signature

		const isSei = SEI_SK &&
			createHmac("sha256", SEI_SK).update(rawBody).digest("hex") === signature

		if (!isSepolia && !isSei) {
			console.error("❌ Unauthorized: Signature Mismatch")
			return new Response("Unauthorized", { status: 401 })
		}

		// 2. Parse Alchemy Payload
		const body = JSON.parse(rawBody)
		const log = body.event?.data?.block?.logs?.[0]

		if (!log) {
			console.warn("⚠️ Reviewers Webhook received but no log found in payload.")
			return new Response("No logs found", { status: 200 })
		}

		// 3. Decode On-Chain Event
		const decoded = decodeEventLog({
			abi,
			data: log.data,
			topics: log.topics,
		})

		const { pubId: publicationId, cid: rootCid } = decoded.args as {
			publisher: `0x${string}`
			pubId: bigint
			cid: string
		}

		const pubIdStr = publicationId.toString()
		const network = isSepolia ? NetworkSchema.enum.sepolia : NetworkSchema.enum.sei_testnet

		console.log(`🚀 [${network.toUpperCase()}] New Submission Detected: Pub #${pubIdStr}`, {
			rootCid,
		})

		// 4. Trigger the Submission Agent (The "Shield")
		// waitUntil keeps the Vercel function alive for forensic checks (Tavily)
		waitUntil(
			startSubmissionAgent({
				network,
				publicationId: pubIdStr,
				rootCid,
			}).then(() => {
				console.log(`✅ Submission Agent Analysis Complete for Pub #${pubIdStr}`)
			}).catch(err => {
				console.error(`❌ Submission Agent failure for Pub #${pubIdStr}:`, err)
			})
		)

		// 5. Respond 202 to Alchemy to prevent retries
		return new Response("Accepted", { status: 202 })

	} catch (err) {
		console.error("💥 Submission Webhook Internal Error:", err)
		return new Response("Internal Error", { status: 500 })
	}
}