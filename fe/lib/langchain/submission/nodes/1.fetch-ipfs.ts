'server-only'

import { IpfsPublication } from "@/app/_schemas/ipfs-publication"
import { Manifest } from "@/app/_schemas/manifest"
import { fetchIpfs } from "@/lib/ipfs/fetch-ipfs"
import type { SubmissionState } from "../state"

export const fetchIpfsNode = async (
	state: SubmissionState,
): Promise<Partial<SubmissionState>> => {
	const { rootCid } = state

	const manifestResponse = await fetchIpfs(rootCid)
	const manifest: Manifest = await manifestResponse.json()

	const abstractResponse = await fetchIpfs(manifest?.payload?.abstractCid)
	const abstract: IpfsPublication["abstract"] = await abstractResponse.text()

	return { publication: { abstract } }
}

