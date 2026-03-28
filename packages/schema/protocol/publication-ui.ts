import { formatEther } from "viem"
import { z } from "zod"
import { EthAddressSchema } from "../eth-address"
import { PublicationRaw, PublicationStatus, PublicationStatusSchema } from "./publication-raw"

// UI Data
export const PublicationSchema = z.object({
  id: z.string(),
  chainId: z.number().nullable(),
  pubId: z.string().nullable(),
  publisher: EthAddressSchema.nullable(),
  reviewersStatus: z.record(EthAddressSchema, z.boolean()).default({}),
  reviewers: z.array(EthAddressSchema).default([]),
  seniorReviewer: EthAddressSchema.nullable().optional(),
  cid: z.string().nullable(),
  status: PublicationStatusSchema,
  lockedStake: z.string(),
  paidSubmissionFee: z.string(),
  verdictCid: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),

  // Indexing Metadata
  lastBlockNumber: z.string(),
  lastLogIndex: z.number(),
})

export type Publication = z.infer<typeof PublicationSchema>

const STATUS_OPTIONS = PublicationStatusSchema.options

export const getStatusAsNumber = (status?: PublicationStatus): number | undefined => {
  if (!status) return undefined

  const index = PublicationStatusSchema.options.indexOf(status)
  return index === -1 ? undefined : index
}

export const mapPublication = (params: PublicationRaw): Publication => {
  return PublicationSchema.parse({
    ...params,
    pubId: params.pubId?.toString() ?? null,
    lockedStake: formatEther(params.lockedStake),
    paidSubmissionFee: formatEther(params.paidSubmissionFee),

    // Status: mapping the integer index to the enum string
    status: STATUS_OPTIONS[params.status] ?? STATUS_OPTIONS[0],

    // Array 
    reviewers: params.reviewers ?? [],
    // JSONB
    reviewersStatus: params.reviewersStatus ?? {},

    lastBlockNumber: params.lastBlockNumber.toString(),
  })
}