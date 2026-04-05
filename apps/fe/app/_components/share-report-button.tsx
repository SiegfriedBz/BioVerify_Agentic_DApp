"use client"

import { CheckIcon, Share2Icon } from "lucide-react"
import { type ComponentProps, type FC, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = Omit<ComponentProps<typeof Button>, "onClick"> & {
	id: string
}

export const ShareReportButton: FC<Props> = (props) => {
	const { id, size = "sm", variant = "outline", className, ...rest } = props
	const [copied, setCopied] = useState(false)

	const handleShare = async () => {
		const url = window.location.href

		try {
			await navigator.clipboard.writeText(url)
			setCopied(true)
			toast.success("Link copied to clipboard", {
				description: `Publication #${id} is ready to share.`,
			})

			setTimeout(() => setCopied(false), 2000)
		} catch (_err) {
			toast.error("Failed to copy link")
		}
	}

	return (
		<Button
			{...rest}
			variant={variant}
			size={size}
			onClick={handleShare}
			className={cn(
				"gap-2 h-8 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer",
				className,
			)}
		>
			{copied ? (
				<CheckIcon className="h-3 w-3 text-green-500" />
			) : (
				<Share2Icon className="h-3 w-3" />
			)}
			{copied ? "Copied!" : "Share Report"}
		</Button>
	)
}
