import { Suspense } from "react"
import { PublicationDetailSkeleton } from "../_components/publication-detail-skeleton"
import { PublicationDetailWrapper } from "../_components/publication-detail-wrapper"

type Props = {
	params: Promise<{ id: string }> // "chainId-pubId"
}

export default async function Page(props: Props) {
	const { params } = props
	const { id } = await params

	return (
		<Suspense fallback={<PublicationDetailSkeleton />}>
			<PublicationDetailWrapper id={id} />
		</Suspense>
	)
}
