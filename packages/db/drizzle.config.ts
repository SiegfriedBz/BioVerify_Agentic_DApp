import { env } from "@packages/env"
import { defineConfig } from "drizzle-kit"
import "server-only"

export default defineConfig({
	schema: "@packages/schema/db/index.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: env.NEON_DATABASE_URL ?? "",
	},
})
