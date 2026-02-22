import { getProtocolConstants } from "@/app/api/contract/get-protocol-constants"
import { FC } from "react"
import { SubmitPublicationForm } from "./submit-publication-form"

export const SubmitPublicationFormContainer: FC = async () => {
	const data = await getProtocolConstants()

	return <SubmitPublicationForm publisherMinStake={data?.publisherMinStake || 0n} />
}