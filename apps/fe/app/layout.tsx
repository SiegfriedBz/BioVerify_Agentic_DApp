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
		default: "BioVerify — Trustless Peer Review at AI Speed",
		template: "%s | BioVerify",
	},
	description:
		"BioVerify is a DeSci agentic DApp for decentralized, trustless peer review. " +
		"Leveraging Chainlink VRF for verifiable reviewer selection and LangGraph AI agents " +
		"for forensic validation, it anchors scientific outcomes on-chain.",
	keywords: [
		"DeSci",
		"agentic",
		"decentralized",
		"DApp",
		"Chainlink VRF",
		"trustless",
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
		title: "BioVerify — Trustless Peer Review at AI Speed",
		description:
			"A DeSci agentic DApp for decentralized, trustless scientific peer review powered by Chainlink VRF and AI agents.",
		locale: "en_US",
		images: [
			{
				url: "/opengraph-image.jpg",
				width: 1200,
				height: 634,
				alt: "BioVerify — Decentralized Science Protocol",
				type: "image/jpeg",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "BioVerify — Trustless Peer Review at AI Speed",
		description:
			"Decentralized scientific peer review. Chainlink VRF selects reviewers, AI agents verify integrity, stakes settle on-chain.",
		images: [
			{
				url: "/opengraph-image.jpg",
				width: 1200,
				height: 634,
				alt: "BioVerify — Decentralized Science Protocol",
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
