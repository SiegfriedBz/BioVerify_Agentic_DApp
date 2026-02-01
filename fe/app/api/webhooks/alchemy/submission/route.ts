import { NetworkSchema } from "@/app/_schemas/wallet"
import { startSubmissionAgent } from "@/lib/langchain/submission/agent"
import { waitUntil } from "@vercel/functions"
import { createHmac } from "node:crypto"
import { decodeEventLog, parseAbi } from "viem"

const SEPOLIA_SK =
	process.env.ALCHEMY_ETH_SEPOLIA_SubmittedPublication_WEBHOOK_SK

// TODO implement the Alchemy Notify Webhook for Sei Testnet
const SEI_SK = process.env.ALCHEMY_SEI_TESTNET_SubmittedPublication_WEBHOOK_SK

const abi = parseAbi([
	"event BioVerify_SubmittedPublication(address publisher, uint256 id, string cid)",
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
		if (!log) return new Response("No logs found", { status: 200 })

		// Decode log
		const decoded = decodeEventLog({
			abi,
			data: log.data,
			topics: log.topics,
		})

		// Extract event params
		const { id: publicationId, cid } = decoded.args as {
			id: bigint
			cid: string
		}

		const publicationIdString = publicationId.toString()

		console.log(
			`🚀 [${isSepolia ? "SEPOLIA" : "SEI Testnet"}] New Submission:`,
			{
				publicationId: publicationIdString,
				cid,
			},
		)

		// 4. Schedule LANGGRAPH Submission Agent as background work
		// => Keep the lambda alive until this promise resolves
		waitUntil(
			startSubmissionAgent({
				network: isSepolia ? NetworkSchema.enum.sepolia : NetworkSchema.enum.sei_testnet,
				publicationId: publicationIdString,
				rootCid: cid,
			}).then(() => {
				console.log(`✅ Background Agent finished for Publication id: ${publicationIdString}`)
			}).catch(err => {
				console.error(`❌ Background Agent failed:`, err)
			})
		)

		// 4'. Return response immediately to Alchemy 
		return new Response("Accepted", { status: 202 })
	} catch (err) {
		console.error("Webhook Logic Error:", err)
		return new Response("Internal Error", { status: 500 })
	}
}
