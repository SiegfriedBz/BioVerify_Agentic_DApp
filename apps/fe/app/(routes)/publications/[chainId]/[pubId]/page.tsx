import { notFound } from "next/navigation"
import { Suspense } from "react"
import { PublicationDetailSkeleton } from "./_components/publication-detail-skeleton"
import { PublicationDetailWrapper } from "./_components/publication-detail-wrapper"

type Props = {
	params: Promise<{ chainId: string, pubId: string }>
}

export default async function Page(props: Props) {
	const { params } = props
	const { chainId, pubId } = await params

	if (!chainId || !pubId) {
		notFound()
	}

	const id = `${chainId}-${pubId}`

	return (
		<Suspense fallback={<PublicationDetailSkeleton />}>
			<PublicationDetailWrapper id={id} />
		</Suspense>
	)
}
