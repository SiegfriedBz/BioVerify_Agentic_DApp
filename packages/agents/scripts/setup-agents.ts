import pgCheckpointer from "../utils/agents-pool"

import "server-only"


async function run() {
  console.log("🚀 Connecting to Neon...")
  await pgCheckpointer.setup()
  console.log("✅ Checkpointer Tables created.")
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})

