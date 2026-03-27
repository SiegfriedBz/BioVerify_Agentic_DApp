import { sql } from "drizzle-orm"
import { bigint, boolean, integer, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core"

/**
 * INDEXING METADATA
 * Used for Optimistic Concurrency Control (OCC).
 * Ensures that out-of-order webhooks never overwrite newer data.
 */
const indexingMetadata = {
  lastBlockNumber: bigint("last_block_number", { mode: "bigint" }).default(sql`0`).notNull(),
  lastLogIndex: integer("last_log_index").default(0).notNull(),
}

const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}

export const memberDbSchema = pgTable("member", {
  id: text("id").primaryKey(), // "chainId-address"
  address: varchar("address", { length: 42 }).notNull(),
  chainId: integer("chain_id").notNull(),
  availableStake: bigint("available_stake", { mode: "bigint" }).default(sql`0`).notNull(),
  lockedStake: bigint("locked_stake", { mode: "bigint" }).default(sql`0`).notNull(),
  reputation: bigint("reputation", { mode: "bigint" }).default(sql`0`).notNull(),
  isAvailable: boolean("is_available").default(false).notNull(),
  activeReviewsCount: integer("active_reviews_count").default(0).notNull(),
  submittedPublicationsIds: bigint("submitted_publications_ids", { mode: "bigint" }).array().default(sql`'{}'`),

  // Actions counters
  rewardsCount: integer("rewards_count").default(0).notNull(),
  slashesCount: integer("slashes_count").default(0).notNull(),

  ...timestamps,
  ...indexingMetadata
})

export const publicationDbSchema = pgTable("publication", {
  id: text("id").primaryKey(), // "chainId-pubId"

  pubId: bigint("pub_id", { mode: "bigint" }),
  chainId: integer("chain_id"),
  publisher: varchar("publisher", { length: 42 }),
  cid: text("cid"),

  paidSubmissionFee: bigint("paid_submission_fee", { mode: "bigint" }).default(sql`0`).notNull(),
  reviewersStatus: jsonb("reviewers_status").$type<Record<string, boolean>>().default({}).notNull(), reviewers: text("reviewers").array().default(sql`'{}'`),
  seniorReviewer: varchar("senior_reviewer", { length: 42 }),
  lockedStake: bigint("locked_stake", { mode: "bigint" }).default(sql`0`).notNull(),
  verdictCid: text("verdict_cid"),
  status: integer("status").default(0).notNull(),
  ...timestamps,
  ...indexingMetadata
})

export const protocolDbSchema = pgTable("protocol", {
  id: text("id").primaryKey(), // "chainId"
  chainId: integer("chain_id").notNull(),

  // Dynamic Pools (Updated by Webhooks)
  rewardPool: bigint("reward_pool", { mode: "bigint" }).default(sql`0`).notNull(),
  slashPool: bigint("slash_pool", { mode: "bigint" }).default(sql`0`).notNull(),

  // Protocol Constants (Populated by Seed Script)
  aiAgent: varchar("ai_agent", { length: 42 }).notNull(),
  treasury: varchar("treasury", { length: 42 }).notNull(),
  vrfNumWords: integer("vrf_num_words").notNull(),
  reputationBoost: bigint("reputation_boost", { mode: "bigint" }).notNull(),
  publisherMinFee: bigint("publisher_min_fee", { mode: "bigint" }).notNull(),
  publisherStake: bigint("publisher_stake", { mode: "bigint" }).notNull(),
  reviewerStake: bigint("reviewer_stake", { mode: "bigint" }).notNull(),
  reviewerReward: bigint("reviewer_reward", { mode: "bigint" }).notNull(),

  ...timestamps,
  ...indexingMetadata
})
