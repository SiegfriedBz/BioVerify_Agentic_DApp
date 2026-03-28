import { NetworkToMessage } from "@/app/_components/network-badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { ChainIdToNetwork } from "@packages/utils"
import { notFound } from "next/navigation"

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

  const network = NetworkToMessage[ChainIdToNetwork[Number.parseInt(chainId, 10)]]

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>Publications</BreadcrumbPage>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>
          <BreadcrumbPage>{network}</BreadcrumbPage>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>
          <BreadcrumbPage>Publication id# {pubId}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
