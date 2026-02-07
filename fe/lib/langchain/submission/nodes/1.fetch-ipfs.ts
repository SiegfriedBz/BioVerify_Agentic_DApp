'server-only'

import { Manifest } from "@/app/_schemas/manifest"
import { Publication } from "@/app/_schemas/publication"
import type { SubmissionState } from "../state"

const PINATA_IPFS_URL = process.env.NEXT_PUBLIC_PINATA_IPFS_URL ?? ""

export const fetchIpfsNode = async (
	state: SubmissionState,
): Promise<Partial<SubmissionState>> => {
	const { rootCid } = state

	const manifestResponse = await fetchIpfs(rootCid)
	const manifest: Manifest = await manifestResponse.json()

	const abstractResponse = await fetchIpfs(manifest?.payload?.abstractCid)
	const abstract: Publication["abstract"] = await abstractResponse.text()

	return { publication: { abstract } }
}

// helper
const fetchIpfs = async (cid: string) => {
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
