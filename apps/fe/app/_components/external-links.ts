import { env } from "@packages/env"
import { GlobeIcon, ScrollTextIcon } from "lucide-react"
import type { ComponentType, SVGProps } from "react"
import { GitHubIcon, LinkedInIcon, TelegramIcon } from "./icons/brand-icons"

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

type ExternalLink = {
	href: string
	label: string
	icon: IconComponent
	tooltip: string
}

function link(
	href: string | undefined,
	label: string,
	icon: IconComponent,
	tooltip: string,
): ExternalLink | null {
	return href ? { href, label, icon, tooltip } : null
}

export const socialLinks: ExternalLink[] = [
	link(env.NEXT_PUBLIC_GITHUB_URL, "GitHub", GitHubIcon, "GitHub"),
	link(env.NEXT_PUBLIC_LINKEDIN_URL, "LinkedIn", LinkedInIcon, "LinkedIn"),
	link(env.NEXT_PUBLIC_PORTFOLIO_URL, "Portfolio", GlobeIcon, "Portfolio"),
	link(env.NEXT_PUBLIC_TELEGRAM_URL, "Telegram", TelegramIcon, "Telegram"),
].filter((l): l is ExternalLink => l !== null)

export const contractLinks: ExternalLink[] = [
	link(
		env.NEXT_PUBLIC_CONTRACT_BASE_SEPOLIA_URL,
		"Base Sepolia",
		ScrollTextIcon,
		"BioVerifyV3 on Base Sepolia",
	),
	link(
		env.NEXT_PUBLIC_CONTRACT_ETH_SEPOLIA_URL,
		"Eth Sepolia",
		ScrollTextIcon,
		"BioVerifyV3 on Ethereum Sepolia",
	),
].filter((l): l is ExternalLink => l !== null)
