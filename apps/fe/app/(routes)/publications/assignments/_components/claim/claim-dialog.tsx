"use client"

import { useMemberByChain } from "@/_hooks/cqrs/queries/use-member-by-chain"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"
import { ComponentProps, FC, useCallback, useState } from "react"
import { ClaimAmountInput } from "./claim-amount-input"
import { ClaimButton } from "./claim-button"
import { ClaimForm } from "./claim-form"

type Props = Omit<ComponentProps<typeof Dialog>, "open" | "onOpenChange"> & {
  activeAddress: string
  activeChainId: number
}

export const ClaimDialog: FC<Props> = (props) => {
  const { activeAddress, activeChainId, ...dialogProps } = props

  const [isOpen, setIsOpen] = useState(false)
  const onCloseDialog = useCallback(() => setIsOpen(false), [])

  const { data: memberData } = useMemberByChain({
    userAddress: activeAddress,
    chainId: activeChainId
  })

  const currentAvailableStakeEth = memberData?.availableStake ?? "0"

  return (

    <Dialog {...dialogProps} open={isOpen} onOpenChange={setIsOpen}>
      <ClaimForm
        activeAddress={activeAddress}
        activeChainId={activeChainId}
        currentAvailableStakeEth={currentAvailableStakeEth}
        onSuccess={onCloseDialog}
      >
        <DialogTrigger asChild>
          <ClaimButton />
        </DialogTrigger>

        <DialogContent className="min-w-fit sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Claim your stake</DialogTitle>
            <DialogDescription>
              Choose an amount to claim.
              You will be withdrawn from the reviewers pool if your available stake drops below the min reviewer stake.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <ClaimAmountInput maxClaimEth={currentAvailableStakeEth} />
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              form="claim-form-id"
              className="font-bold"
              type="submit">Claim</Button>
          </DialogFooter>
        </DialogContent>
      </ClaimForm>
    </Dialog>
  )
}
