import { Suspense } from "react"
import { PublicationDetailContainer } from "../_components/publication-detail-container"
import { PublicationDetailSkeleton } from "../_components/publication-detail-skeleton"

type Props = {
	params: Promise<{ pubId: string }>
}

export default async function Page(props: Props) {
	const { params } = props
	const { pubId } = await params

	return (
		<Suspense fallback={<PublicationDetailSkeleton />}>
			<PublicationDetailContainer pubId={pubId} />
		</Suspense>
	)
}

