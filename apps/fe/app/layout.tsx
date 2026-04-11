import type { Metadata } from "next"
import { Geist_Mono, Inter, Space_Grotesk } from "next/font/google"
import { ThemeProvider } from "@/_context/theme-provider"
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
	title: "BioVerify",
	description: "Next.js Agentic DApp",
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
			</body>
		</html>
	)
}
