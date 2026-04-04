import { NetworkToMessage } from "@/app/_components/network-badge"
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ChainIdToNetwork } from "@packages/utils"
import Link from "next/link"
import { notFound } from "next/navigation"

type Props = {
	params: Promise<{ chainId: string; pubId: string }> // "chainId-pubId"
}

export default async function Page(props: Props) {
	const { params } = props
	const { chainId, pubId } = await params

	if (!chainId || !pubId) {
		notFound()
	}

	const network =
		NetworkToMessage[ChainIdToNetwork[Number.parseInt(chainId, 10)]]

	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link href="/publications">Publications</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>

				<BreadcrumbSeparator />

				<BreadcrumbItem>
					<BreadcrumbPage>{network}</BreadcrumbPage>
				</BreadcrumbItem>

				<BreadcrumbSeparator />

				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link href={`/publications/${chainId}/${pubId}`}>
							Publication # {pubId}
						</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>

				<BreadcrumbSeparator />

				<BreadcrumbItem>
					<BreadcrumbPage>Review</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	)
}
