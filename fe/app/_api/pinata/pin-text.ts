"use server"

const PINATA_JWT = process.env.PINATA_API_JWT

type Params = {
	text: string
	fileName: string
}

/**
 * Helper to pin a simple string as a text file to get a unique CID
 */
export const pinText = async (params: Params): Promise<string> => {
	const { text, fileName } = params

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

