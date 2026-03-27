import { env } from "@packages/env"
import { IpfsPublicationSchema } from "@packages/schema"
import "server-only"
import { z } from "zod"

const PINATA_JWT = env.PINATA_API_JWT

export type Params = z.infer<
  typeof IpfsPublicationSchema
>

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
      pinText({ text: params.title, fileName: "title.txt" }),
      pinText({ text: params.abstract, fileName: "abstract.txt" }),
      pinText({ text: params.manuscript, fileName: "manuscript.txt" }),
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

type PinTextParams = {
  text: string
  fileName: string
}

/**
 * Helper to pin a simple string as a text file to get a unique CID
 */
export const pinText = async (params: PinTextParams): Promise<string> => {
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





