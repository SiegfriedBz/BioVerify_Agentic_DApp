import type { IpfsPublication, Manifest } from "@packages/schema"
import { fetchIpfs } from "@packages/utils"
import "server-only"
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
