"use client"

import { Button } from "@/components/ui/button"
import { CheckIcon, Share2Icon } from "lucide-react"
import { FC, useState } from "react"
import { toast } from "sonner"

type Props = {
  pubId: number
}

export const ShareReportButton: FC<Props> = (props) => {
  const { pubId } = props
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Link copied to clipboard", {
        description: `Publication #${pubId} is ready to share.`
      })

      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy link")
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="gap-2 h-8 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
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