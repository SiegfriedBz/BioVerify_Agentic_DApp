import { SideProvider } from "@/_context/side-provider"
import { headers } from "next/headers"
import { Toaster } from "sonner"

export default async function Layout({
	children,
	breadcrumbs,
}: Readonly<{
	children: React.ReactNode
	breadcrumbs: React.ReactNode
}>) {
	const headersObj = await headers()
	const cookies = headersObj.get("cookie")

	return (
		<SideProvider cookies={cookies}>
			{breadcrumbs}
			<main className="max-w-7xl flex flex-col gap-6 pt-6 pb-2">
				{children}
				<Toaster />
			</main>
		</SideProvider>
	)
}
