import { ThemeProvider } from "@/_context/theme-provider"
import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next"
import { Geist_Mono, Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
})

const spaceGrotesk = Space_Grotesk({
	variable: "--font-space-grotesk",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
	),
	title: {
		default: "BioVerify: Peer Review as a Coordination Game",
		template: "%s | BioVerify",
	},
	description:
		"BioVerify is a DeSci DApp on testnets that treats peer review as a coordination game: " +
		"authors and reviewers stake ETH, Chainlink VRF draws the reviewers, and AI agents screen " +
		"submissions and settle outcomes on chain.",
	keywords: [
		"DeSci",
		"agentic",
		"decentralized",
		"DApp",
		"Chainlink VRF",
		"peer review",
		"scientific validation",
		"on-chain",
		"LangGraph",
		"BioVerify",
	],
	authors: [{ name: "Siegfried Bozza" }],
	openGraph: {
		type: "website",
		siteName: "BioVerify",
		title: "BioVerify: Peer Review as a Coordination Game",
		description:
			"BioVerify is a DeSci DApp on testnets that treats peer review as a coordination game: authors and reviewers stake ETH, Chainlink VRF draws the reviewers, and AI agents screen submissions and settle outcomes on chain.",
		locale: "en_US",
		images: [
			{
				url: "/opengraph-image.jpg",
				width: 1200,
				height: 634,
				alt: "BioVerify: decentralized science protocol",
				type: "image/jpeg",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "BioVerify: Peer Review as a Coordination Game",
		description:
			"BioVerify is a DeSci DApp on testnets that treats peer review as a coordination game: authors and reviewers stake ETH, Chainlink VRF draws the reviewers, and AI agents screen submissions and settle outcomes on chain.",
		images: [
			{
				url: "/opengraph-image.jpg",
				width: 1200,
				height: 634,
				alt: "BioVerify: decentralized science protocol",
			},
		],
	},
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} font-sans antialiased`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
				<Analytics />
			</body>
		</html>
	)
}
