"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CheckIcon, CopyIcon } from "lucide-react"
import { FC, useCallback, useState } from "react"
import { TypographySmall } from "./typography"

const DELAY = 2_000

type Props = {
  address: string
  className?: string
}

export const AddressDisplay: FC<Props> = ({ address, className }) => {
  const [copied, setCopied] = useState(false)

  const displayAddress = `${address.slice(0, 6)}...${address.slice(-4)}`

  const copyToClipboard = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), DELAY)
    } catch (err) {
      console.error("Failed to copy address", err)
    }
  }, [])

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={copyToClipboard}
      className={cn(
        "group h-auto px-2 py-1 gap-2 hover:bg-primary/10 transition-colors",
        className
      )}
      title={address}
    >
      <TypographySmall className="font-mono font-medium text-foreground/80 group-hover:text-primary">
        {displayAddress}
      </TypographySmall>

      <div className="relative flex h-3 w-3 items-center justify-center">
        {copied ? (
          <CheckIcon className="h-3 w-3 text-green-500 animate-in fade-in zoom-in duration-200" />
        ) : (
          <CopyIcon className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
      </div>
    </Button>
  )
}