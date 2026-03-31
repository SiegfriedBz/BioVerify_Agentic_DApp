
import { inngest } from "@/inngest/client"
import { processContractEvent } from "@packages/cqrs"
import { env } from "@packages/env"
import { NetworkSchema, NetworkT } from "@packages/schema"
import { bioVerifyAbi, NetworkToChainId } from "@packages/utils"
import { waitUntil } from "@vercel/functions"
import { createHmac } from "crypto"
import { NextResponse } from "next/server"
import { decodeEventLog } from "viem"

const SECRETS: Record<NetworkT, string | undefined> = {
  [NetworkSchema.enum.base_sepolia]: env.ALCHEMY_BASE_SEPOLIA_WH_SK,
  [NetworkSchema.enum.eth_sepolia]: env.ALCHEMY_ETH_SEPOLIA_WH_SK,
}

export async function POST(req: Request) {
  const signature = req.headers.get("x-alchemy-signature")
  const rawBody = await req.text()
  if (!signature) return new Response("Missing signature", { status: 401 })

  const isValid = (secret: string) =>
    createHmac("sha256", secret).update(rawBody).digest("hex") === signature

  let activeChainId: number | null = null
  if (SECRETS.base_sepolia && isValid(SECRETS.base_sepolia)) {
    activeChainId = NetworkToChainId[NetworkSchema.enum.base_sepolia]
  } else if (SECRETS.eth_sepolia && isValid(SECRETS.eth_sepolia)) {
    activeChainId = NetworkToChainId[NetworkSchema.enum.eth_sepolia]
  }

  if (!activeChainId) return NextResponse.json({ error: "Invalid signature" }, { status: 401 })

  const json = JSON.parse(rawBody)
  const logs = json.event?.data?.block?.logs || []
  const blockNumber = BigInt(json.event?.data?.block?.number || 0)

  waitUntil((async () => {
    for (const log of logs) {
      try {
        const decoded = decodeEventLog({
          abi: bioVerifyAbi,
          data: log.data,
          topics: log.topics,
        })

        if (!decoded.eventName) {
          console.warn(`[Webhook] Skipping anonymous/undecoded event at block ${blockNumber}`)
          continue
        }

        // Call the CQRS handler
        await processContractEvent({
          chainId: activeChainId as number,
          decoded: decoded as unknown as { eventName: string, args: any },
          blockNumber,
          logIndex: Number(log.index),
          inngest: inngest
        })

      } catch (e) {
        console.error(`[Webhook] Failed to process log at block ${blockNumber}:`, e)
      }
    }
  })())

  return NextResponse.json({ received: true })
}

