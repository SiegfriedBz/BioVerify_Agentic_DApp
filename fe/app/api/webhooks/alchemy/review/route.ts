import { startReviewersAgent } from "@/lib/langchain/review/start-agent"
import { waitUntil } from "@vercel/functions"
import { createHmac } from "node:crypto"
import { decodeEventLog, parseAbi } from "viem"

const abi = parseAbi([
	"event BioVerify_Agent_PickReviewers(uint256 indexed pubId,address[] reviewers,address indexed seniorReviewer,string rootCid,uint256 minValidReviewsCount)"
])

const SEPOLIA_SK = process.env.ALCHEMY_ETH_SEPOLIA_Agent_PickedReviewers_WEBHOOK_SK
const SEI_SK = process.env.ALCHEMY_SEI_TESTNET_Agent_PickedReviewers_WEBHOOK_SK

export async function POST(req: Request) {
	if (!SEPOLIA_SK && !SEI_SK) {
		console.error("❌ Critical: Webhook secrets are missing.")
		return new Response("Configuration Error", { status: 500 })
	}

	try {
		const signature = req.headers.get("x-alchemy-signature")
		const rawBody = await req.text()

		if (!signature) return new Response("Missing signature", { status: 401 })

		// 1. Signature Verification
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

		const { pubId, rootCid, reviewers, seniorReviewer, minValidReviewsCount } = decoded.args as {
			pubId: bigint
			rootCid: string
			reviewers: `0x${string}`[]
			seniorReviewer: `0x${string}`
			minValidReviewsCount: bigint
		}

		const pubIdString = pubId.toString()

		console.log(`🚀 Webhook - Reviewers Picked for Pub #${pubIdString}`, {
			reviewers,
			seniorReviewer,
			rootCid,
			minValidReviewsCount
		})

		// 4. Trigger the Reviewer Agent
		// waitUntil ensures the Vercel function stays alive to start the Reviewers Graph
		waitUntil(
			startReviewersAgent({
				publicationId: pubIdString,
				rootCid,
				reviewers,
				seniorReviewer,
				minValidReviewsCount: Number(minValidReviewsCount)
			}).then(() => {
				console.log(`✅ Reviewers Agent Settlement Complete for Pub #${pubIdString}`)
			}).catch(err => {
				console.error(`❌ Reviewers Agent failure for Pub #${pubIdString}:`, err)
			})
		)

		// 5. Respond 202 immediately to Alchemy to avoid timeouts
		return new Response("Accepted", { status: 202 })

	} catch (err) {
		console.error("💥 Reviewers Webhook Internal Error:", err)
		return new Response("Internal Error", { status: 500 })
	}
}