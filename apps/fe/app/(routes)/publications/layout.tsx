import { SideProvider } from "@/_context/side-provider"
import { headers } from "next/headers"
import { Toaster } from "sonner"
import { PublicationsRealtimeProvider } from "./_components/publications-realtime-provider"

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
			<PublicationsRealtimeProvider>
				{breadcrumbs}
				<main className="max-w-7xl flex flex-col gap-6 pt-6 pb-2">
					{children}
					<Toaster />
				</main>
			</PublicationsRealtimeProvider>
		</SideProvider>
	)
}
