"use client"

import { useProtocolByChain } from "@/_hooks/cqrs/queries/use-protocol-by-chain"
import { useAuthFromWallet } from "@/_hooks/use-auth-from-wallet"
import { FetchError } from "@/app/_components/fetch-error"
import { TypographyP, TypographySmall } from "@/app/_components/typography"
import { Button } from "@/components/ui/button"
import type { Protocol } from "@packages/schema"
import { ChainIdToNetwork, NetworkToChainId } from "@packages/utils"
import type { FC } from "react"
import { SubmitPublicationForm } from "./submit-publication-form"

const DEFAULT_CHAIN_ID = NetworkToChainId.base_sepolia

type Props = {
	server: {
		initialData: Protocol | null
		chainId: number | null
	}
}

export const SubmitPublicationFormContainer: FC<Props> = (props) => {
	const { server } = props
	const { walletChainId } = useAuthFromWallet()

	const activeChainId = walletChainId || server.chainId || DEFAULT_CHAIN_ID

	const validatedInitialData =
		activeChainId === server.initialData?.chainId ? server.initialData : null

	const { data, isFetching, isError, isPending, refetch } = useProtocolByChain({
		initialData: validatedInitialData,
		chainId: activeChainId,
	})

	if (isError) return <FetchError refetch={refetch} />

	if (isPending || (isFetching && data === undefined)) {
		return <div className="h-30 w-full animate-pulse bg-muted rounded-xl" />
	}

	if (data === null) {
		return (
			<div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-6 text-center">
				<TypographySmall className="font-bold uppercase tracking-widest text-muted-foreground">
					No protocol on this network
				</TypographySmall>
				<TypographyP className="mt-0! max-w-md text-sm text-muted-foreground">
					There is no BioVerify protocol record for the chain your wallet is
					using. Switch to a supported testnet in the sidebar, or retry after
					your network stabilizes.
				</TypographyP>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => refetch()}
				>
					Retry
				</Button>
			</div>
		)
	}

	return (
		<SubmitPublicationForm
			network={ChainIdToNetwork[data.chainId]}
			publisherStake={data.publisherStake}
		/>
	)
}
