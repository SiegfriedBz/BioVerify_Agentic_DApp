import { ChainIdToNetwork } from "@packages/utils"
import { Link } from "lucide-react"
import { notFound } from "next/navigation"
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

type Props = {
	params: Promise<{ id: string }> // "chainId-pubId"
}

export default async function Page(props: Props) {
	const { params } = props
	const { id } = await params

	const [chainId, pubId] = id.split("-")
	if (!chainId || !pubId) {
		return notFound()
	}

	const network = ChainIdToNetwork[Number.parseInt(chainId, 10)]

	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link href="/reviews">Reviews</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>

				<BreadcrumbSeparator />

				<BreadcrumbItem>
					<BreadcrumbPage>{network}</BreadcrumbPage>
				</BreadcrumbItem>

				<BreadcrumbSeparator />

				<BreadcrumbItem>
					<BreadcrumbPage>Publication id# {pubId}</BreadcrumbPage>
				</BreadcrumbItem>

				<BreadcrumbSeparator />

				<BreadcrumbItem>
					<BreadcrumbPage>Submit review</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	)
}
