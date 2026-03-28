"use server"

import { SubmitPublicationFormT } from "../_schemas/submit-publication-form"

type Params = SubmitPublicationFormT
export const pinManifest = async (params: Params) => {

  const { createAndPinManifestRootCid } = await import(
    "@packages/utils-server"
  )
  const rootCid = await createAndPinManifestRootCid(params)

  return rootCid
}