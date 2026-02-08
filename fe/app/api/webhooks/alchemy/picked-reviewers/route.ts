import { NetworkSchema } from "@/app/_schemas/wallet"
import { startReviewersAgent } from "@/lib/langchain/reviewers/start-agent"
import { waitUntil } from "@vercel/functions"
import { createHmac } from "node:crypto"
import { decodeEventLog, parseAbi } from "viem"

// TODO update event to pass rootCid (and no need for requestId)

/**
	cast sig-event "BioVerify_Agent_PickedReviewers(uint256 publicationId,address[] reviewers,uint256 requestId)"
	0x7ef33b29e83d408fdfb29a3c6af99eb9447d5be2cdcaf30a0682fdc35c6e674d
 */

const SEPOLIA_SK =
	process.env.ALCHEMY_ETH_SEPOLIA_Agent_PickedReviewers_WEBHOOK_SK

// TODO implement the Alchemy Notify Webhook for Sei Testnet
const SEI_SK = process.env.ALCHEMY_SEI_TESTNET_Agent_PickedReviewers_WEBHOOK_SK

const abi = parseAbi([
	"event BioVerify_Agent_PickedReviewers(uint256 publicationId, address[] reviewers, uint256 requestId)",
])

export async function POST(req: Request) {
	if (!SEPOLIA_SK && !SEI_SK) {
		console.error("❌ Critical: Webhook secrets are missing from environment.")
		return new Response("Configuration Error", { status: 500 })
	}

	try {
		const signature = req.headers.get("x-alchemy-signature")
		const rawBody = await req.text()

		// Verify against whichever keys are available
		const isSepolia =
			SEPOLIA_SK &&
			createHmac("sha256", SEPOLIA_SK).update(rawBody).digest("hex") ===
			signature

		const isSei =
			SEI_SK &&
			createHmac("sha256", SEI_SK).update(rawBody).digest("hex") === signature

		if (!isSepolia && !isSei) {
			console.error("❌ Signature Mismatch")
			return new Response("Unauthorized", { status: 401 })
		}

		const body = JSON.parse(rawBody)
		const log = body.event?.data?.block?.logs?.[0]
		if (!log) return new Response("Agent_PickedReviewers - No logs found", { status: 200 })

		// Decode log
		const decoded = decodeEventLog({
			abi,
			data: log.data,
			topics: log.topics,
		})

		// Extract event params
		const { publicationId, reviewers, requestId } = decoded.args as {
			publicationId: bigint
			reviewers: string[]
			requestId: bigint
		}

		const publicationIdString = publicationId.toString()
		const requestIdString = requestId.toString()

		console.log(
			`🚀 [${isSepolia ? "SEPOLIA" : "SEI Testnet"}] New Reviewers picked:`,
			{
				publicationId: publicationIdString,
				reviewers,
				requestId: requestIdString
			},
		)

		// 4. Schedule LANGGRAPH Reviewers Agent as background work
		// => Keep the lambda alive until this promise resolves
		waitUntil(
			startReviewersAgent({
				network: isSepolia ? NetworkSchema.enum.sepolia : NetworkSchema.enum.sei_testnet,
				publicationId: publicationIdString,
				rootCid: requestIdString, // TODO FIX AND PASS ROOT_CID
				reviewers
			}).then(() => {
				console.log(`✅ Agent_PickedReviewers - Background Agent finished for Publication id: ${publicationIdString}`)
			}).catch(err => {
				console.error(`❌ Agent_PickedReviewers - Background Agent failed:`, err)
			})
		)

		// 4'. Return response immediately to Alchemy 
		return new Response("Accepted", { status: 202 })
	} catch (err) {
		console.error("Agent_PickedReviewers - Webhook Logic Error:", err)
		return new Response("Internal Error", { status: 500 })
	}
}



