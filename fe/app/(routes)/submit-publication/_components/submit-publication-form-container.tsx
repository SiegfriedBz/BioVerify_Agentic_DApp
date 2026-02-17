import { getProtocolConstantsMock } from "@/lib/protocol/get-protocol-constants"
import { FC } from "react"
import { SubmitPublicationForm } from "./submit-publication-form"

export const SubmitPublicationFormContainer: FC = async () => {
	// TODO call getProtocolConstants after next solidty deployment
	const data = await getProtocolConstantsMock()

	return <SubmitPublicationForm publisherMinStake={data?.publisherMinStake || 0n} />
}