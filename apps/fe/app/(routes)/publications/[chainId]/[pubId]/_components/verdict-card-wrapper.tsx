import { fetchIpfs } from "@packages/utils"
import type { FC } from "react"
import { VerdictCardContent } from "./verdict-card-content"

type Props = {
	verdictCid: string
}

export const VerdictCardWrapper: FC<Props> = async (props: Props) => {
	const { verdictCid } = props

	if (!verdictCid) return null

	const data = await fetchIpfs(verdictCid)
	const verdict: string = await data.text()

	return <VerdictCardContent verdictCid={verdictCid} initialVerdict={verdict} />
}
