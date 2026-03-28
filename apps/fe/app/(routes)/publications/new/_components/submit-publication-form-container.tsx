"use client"

import { useProtocolByChain } from "@/_hooks/cqrs/queries/use-protocol-by-chain"
import { useAuthFromWallet } from "@/_hooks/use-auth-from-wallet"
import { FetchError } from "@/app/_components/fetch-error"
import { Protocol } from "@packages/schema"
import { ChainIdToNetwork } from "@packages/utils"
import { useRouter } from "next/navigation"
import { FC } from "react"
import { SubmitPublicationForm } from "./submit-publication-form"

type Props = {
	server: {
		initialData: Protocol | null
		chainId: number | null
	}
}

export const SubmitPublicationFormContainer: FC<Props> = (props) => {
	const { server } = props
	const router = useRouter()
	const { walletChainId } = useAuthFromWallet()

	// Fallback chain logic
	const activeChainId = walletChainId || server.chainId

	// Ensure validatedInitialData is only used if the chain is a match
	const validatedInitialData =
		activeChainId && activeChainId === server.initialData?.chainId
			? server.initialData
			: null

	const { data, isFetching, isError, refetch } = useProtocolByChain({
		initialData: validatedInitialData,
		chainId: activeChainId
	})

	if (!activeChainId) {
		return <div className="p-4 text-center">Please connect your wallet.</div>
	}

	if (isError) return <FetchError refetch={refetch} />

	if (isFetching && !data) {
		return <div className="h-30 w-full animate-pulse bg-muted rounded-xl" />
	}

	if (!data) {
		router.push("/")
		return null
	}

	return (
		<SubmitPublicationForm
			network={ChainIdToNetwork[data.chainId]}
			publisherStake={data.publisherStake}
		/>
	)
}