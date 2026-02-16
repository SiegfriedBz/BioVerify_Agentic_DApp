"use client"

import { TypographyH3, TypographyP, TypographySmall } from "@/app/_components/typography"
import { usePayReviewerStake } from "@/app/_hooks/use-register-as-reviewer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck } from "lucide-react"
import { FC, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { formatEther } from "viem"
import { BaseError } from "wagmi"

type Props = { minStake: bigint }

export const ReviewerRegistration: FC<Props> = ({ minStake }) => {
  const {
    payReviewerMinStake,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  } = usePayReviewerStake()

  const onRegister = useCallback(() => {
    payReviewerMinStake()
  }, [])

  useEffect(() => {
    if (error) {
      toast.error(
        <div>
          <span>Failed to register on chain.</span>
          <span>
            Error: {(error as BaseError).shortMessage || error.message}
          </span>
          <span>Please try again</span>
        </div>,
      )
      return
    }

    if (isPending) {
      toast.info("Registering on chain...")
      return
    }

    if (isConfirming) {
      toast.info("Waiting for transaction confirmation...")
      return
    }

    if (isConfirmed) {
      toast.success("Transaction confirmed.")
      return
    }
  }, [error, isPending, isConfirming, isConfirmed])

  return (
    <Card className="border-border bg-card overflow-hidden">
      {/* Container-aware grid: Stacks on mobile, splits 2/1 on desktop */}
      <div className="grid grid-cols-1 @4xl:grid-cols-3">

        <CardContent className="p-8 @4xl:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-foreground" />
            <TypographyH3 className="mt-0! text-xl font-bold">Reviewer Enrollment</TypographyH3>
          </div>

          <TypographyP className="text-muted-foreground text-sm leading-relaxed">
            Active participation in the peer-review process requires a security deposit.
            This deposit is used to align incentives and is subject to slashing if a reviewer
            submits data that contradicts the eventual protocol consensus.
          </TypographyP>

          <div className="flex gap-8 pt-2">
            <div>
              <TypographySmall className="text-muted-foreground uppercase text-[10px] font-bold tracking-tight">
                Required Stake
              </TypographySmall>
              <p className="text-lg font-mono font-bold">{formatEther(minStake)} ETH</p>
            </div>
            <div>
              <TypographySmall className="text-muted-foreground uppercase text-[10px] font-bold tracking-tight">
                Protocol Role
              </TypographySmall>
              <p className="text-lg font-bold">Peer Reviewer</p>
            </div>
          </div>
        </CardContent>

        <div className="bg-muted/30 p-8 flex flex-col justify-center border-t @4xl:border-t-0 @4xl:border-l border-border">
          <Button onClick={onRegister}
            type="button" size="lg" className="w-full font-bold">
            Execute Registration
          </Button>
          <TypographySmall className="mt-4 text-[10px] text-muted-foreground leading-tight text-center">
            Transaction will lock {formatEther(minStake)} ETH in the Reviewer Registry contract.
          </TypographySmall>
        </div>

      </div>
    </Card>
  )
}