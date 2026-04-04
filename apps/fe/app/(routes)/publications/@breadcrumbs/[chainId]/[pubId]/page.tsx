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
	params: Promise<{ chainId: string; pubId: string }>
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
					<BreadcrumbPage>Publication # {pubId}</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	)
}
