import { RootProviders } from "@/_context/root-providers"
import { Toaster } from "@/components/ui/sonner"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { headers } from "next/headers"
import "./globals.css"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: "BioVerify",
	description: "Next.js Agentic DApp",
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const headersObj = await headers()
	const cookies = headersObj.get("cookie")

	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<RootProviders cookies={cookies}>
					{children}
					<Toaster />
				</RootProviders>
			</body>
		</html>
	)
}
