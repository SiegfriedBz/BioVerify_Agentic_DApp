"use client"

import { useClaim } from "@/_hooks/cqrs/commands/use-claim"
import { zodResolver } from "@hookform/resolvers/zod"
import { type FC, PropsWithChildren, useCallback } from "react"
import {
  type DefaultValues,
  FormProvider,
  type SubmitHandler,
  useForm
} from "react-hook-form"
import { toast } from "sonner"
import { parseEther } from "viem"
import { ClaimFormSchema, ClaimFormSchemaT, ClaimFormSchemaValues } from "./_schemas/claim-form"

const DEFAULT_VALUES: DefaultValues<ClaimFormSchemaValues> = {
  amount: "0",
}

type Props = {
  activeAddress: string
  activeChainId: number
  currentAvailableStakeEth: string
  onSuccess?: () => void
}

export const ClaimForm: FC<PropsWithChildren<Props>> = (props) => {
  const { activeAddress, activeChainId, currentAvailableStakeEth, onSuccess, children } = props

  const { mutate, isPending: isPendingClaim } = useClaim({
    chainId: activeChainId,
    userAddress: activeAddress
  })

  const form = useForm<ClaimFormSchemaValues>({
    resolver: zodResolver(ClaimFormSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
  })

  const onSubmit: SubmitHandler<ClaimFormSchemaValues> = useCallback(
    async (data) => {
      const payload = data as ClaimFormSchemaT
      try {
        const claimedAmountWei = parseEther(payload.amount)

        if (parseEther(currentAvailableStakeEth) < claimedAmountWei) {
          toast.error(`Max amount to claim: ${currentAvailableStakeEth} ETH`)
          return
        }

        // Trigger the callback (close dialog) when the mutation succeeds 
        mutate(
          { amountWei: claimedAmountWei },
          {
            onSuccess: () => {
              onSuccess?.()
            }
          }
        )

      } catch (e) {
        console.error("Form submission error:", e)
      }
    },
    [mutate, currentAvailableStakeEth, onSuccess],
  )

  return (
    <FormProvider {...form}>
      <form
        id="claim-form-id"
        onSubmit={form.handleSubmit(onSubmit)}
        className="@max-md:w-full bg-primary font-bold tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {children}
      </form>
    </FormProvider>
  )
}