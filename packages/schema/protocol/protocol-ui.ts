import { formatEther } from "viem"
import { z } from "zod"
import { ProtocolRaw } from "./protocol-raw"

// UI Data
export const ProtocolSchema = z.object({
  id: z.string(),
  chainId: z.number(),
  rewardPool: z.string(), // Formatted ETH string
  slashPool: z.string(),  // Formatted ETH string
  aiAgent: z.string(), // address
  treasury: z.string(), // address
  vrfNumWords: z.number().int(),
  reputationBoost: z.number(),
  publisherMinFee: z.string(), // Formatted ETH string
  publisherStake: z.string(),  // Formatted ETH string
  reviewerStake: z.string(),   // Formatted ETH string
  reviewerReward: z.string(),  // Formatted ETH string
  createdAt: z.date(),
  updatedAt: z.date(),

  // Indexing Metadata
  lastBlockNumber: z.string(),
  lastLogIndex: z.number(),
})

export type Protocol = z.infer<typeof ProtocolSchema>

export const mapProtocol = (raw: ProtocolRaw): Protocol => {
  return ProtocolSchema.parse({
    ...raw,
    reputationBoost: Number(raw.reputationBoost),
    rewardPool: formatEther(raw.rewardPool),
    slashPool: formatEther(raw.slashPool),
    publisherMinFee: formatEther(raw.publisherMinFee),
    publisherStake: formatEther(raw.publisherStake),
    reviewerStake: formatEther(raw.reviewerStake),
    reviewerReward: formatEther(raw.reviewerReward),
    lastBlockNumber: raw.lastBlockNumber.toString()
  })
}