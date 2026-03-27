import { env } from "@packages/env"

const PINATA_IPFS_URL = env.NEXT_PUBLIC_PINATA_IPFS_URL ?? ""

export const fetchIpfs = async (cid: string) => {
  try {
    const res = await fetch(`${PINATA_IPFS_URL}/${cid}`)

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    return res
  } catch (err) {
    throw new Error(err instanceof Error ? err?.message : "Fetch failed")
  }
} 
