import { SideProvider } from "@/_context/side-provider"

export default async function Layout({
	children,
	breadcrumbs,
}: Readonly<{
	children: React.ReactNode
	breadcrumbs: React.ReactNode
}>) {

	return (
		<SideProvider>
			{breadcrumbs}
			<main className="max-w-7xl flex flex-col gap-6 pt-6 pb-2">
				{children}
			</main>
		</SideProvider>
	)
}
