"use server"

import { IpfsPublicationSchema } from "@/app/_schemas/ipfs-publication"
import z from "zod"

const PINATA_JWT = process.env.PINATA_API_JWT

export type Params = z.infer<
	typeof IpfsPublicationSchema
>

/**
 * Helper to pin a simple string as a text file to get a unique CID
 */
const pinText = async (text: string, fileName: string) => {
	const formData = new FormData()
	// Create a Blob from the string to simulate a file upload
	const blob = new Blob([text], { type: "text/plain" })
	formData.append("file", blob, fileName)

	const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
		method: "POST",
		headers: { Authorization: `Bearer ${PINATA_JWT}` },
		body: formData,
	})

	if (!res.ok) throw new Error(`Failed to pin text: ${fileName}`)
	const json = await res.json()
	return json.IpfsHash as string
}

export const createAndPinManifestRootCid = async (
	params: Params,
) => {
	try {
		// 1. Upload Attachments (Binary Files)
		const attachments = await Promise.all(
			(params.files || []).map(async (fileObj: any) => {
				const formData = new FormData()
				formData.append("file", fileObj.file)

				const res = await fetch(
					"https://api.pinata.cloud/pinning/pinFileToIPFS",
					{
						method: "POST",
						headers: { Authorization: `Bearer ${PINATA_JWT}` },
						body: formData,
					},
				)

				const json = await res.json()
				return {
					name: fileObj.name,
					type: fileObj.type,
					cid: json.IpfsHash,
				}
			}),
		)

		// 2. Upload Title, Abstract, and Manuscript as individual files
		// This gives us the specific CIDs for the Payload
		const [titleCid, abstractCid, manuscriptCid] = await Promise.all([
			pinText(params.title, "title.txt"),
			pinText(params.abstract, "abstract.txt"),
			pinText(params.manuscript, "manuscript.txt"),
		])

		// 3. Build the Manifest object to match the ManifestSchema
		const manifestData = {
			metadata: {
				authors: params.authors,
				license: params.license || "",
			},
			payload: {
				titleCid,
				abstractCid,
				manuscriptCid,
				attachments,
			},
		}

		// 4. Pin the final Root Manifest
		const resManifest = await fetch(
			"https://api.pinata.cloud/pinning/pinJSONToIPFS",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${PINATA_JWT}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(manifestData),
			},
		)

		const finalJson = await resManifest.json()
		const rootCid = finalJson.IpfsHash
		return rootCid
	} catch (error) {
		console.error("BioVerify Pinning Error:", error)
		return null
	}
}
