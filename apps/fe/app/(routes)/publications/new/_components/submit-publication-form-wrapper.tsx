import { getAuthFromCookies } from "@/_services/wagmi/get-auth-from-cookies"
import { getProtocolByChain } from "@packages/cqrs"
import { FC } from "react"
import { SubmitPublicationFormContainer } from "./submit-publication-form-container"

export const SubmitPublicationFormWrapper: FC = async () => {
	const { chainId } = await getAuthFromCookies()

	const initialData = await getProtocolByChain({
		chainId
	})

	return (
		<SubmitPublicationFormContainer
			server={{
				initialData,
				chainId: chainId ?? null
			}}
		/>
	)
}