"use client"

import type { FC } from "react"
import { Button } from "@/components/ui/button"

type Props = {
	refetch: () => Promise<unknown> | undefined
}

export const FetchError: FC<Props> = (props) => {
	const { refetch } = props

	return (
		<div className="p-6 border border-error/50 rounded-xl bg-error/10 flex flex-col items-center gap-2 text-center">
			<h3 className="font-bold text-error">Network Error</h3>
			<p className="text-sm text-muted-foreground">
				Failed to sync with the blockchain.
			</p>
			<Button
				type="button"
				onClick={() => refetch()}
				className="mt-2 text-xs underline font-bold uppercase"
			>
				Try Again
			</Button>
		</div>
	)
}
