"use client"

import { useIsFetching, useQueryClient } from "@tanstack/react-query"
import { ClipboardListIcon, Loader2, RefreshCwIcon } from "lucide-react"
import { type FC, useCallback } from "react"
import { useMemberByChain } from "@/_hooks/cqrs/queries/use-member-by-chain"
import { assignmentKeys } from "@/_hooks/cqrs/query-keys/assignments-keys"
import { Button } from "@/components/ui/button"
import { ReviewerTable } from "./table/reviewer-table"

type Props = {
	activeAddress: string
	activeChainId: number
}

export const ReviewerAssignmentsContainer: FC<Props> = (props) => {
	const { activeAddress, activeChainId } = props

	const { data: memberData } = useMemberByChain({
		userAddress: activeAddress,
		chainId: activeChainId,
	})

	if (!memberData) return null

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<ClipboardListIcon className="h-5 w-5 text-primary" />
					<h3 className="text-xl font-bold tracking-tight">
						Active Assignments
					</h3>
				</div>
				<RefreshButton userAddress={activeAddress} />
			</div>

			<ReviewerTable userAddress={activeAddress} />
		</div>
	)
}

type RefreshButtonProps = {
	userAddress: string
}
const RefreshButton: FC<RefreshButtonProps> = (props) => {
	const { userAddress } = props

	const queryClient = useQueryClient()

	const assignmentsFetching =
		useIsFetching({
			queryKey: assignmentKeys.all,
		}) > 0

	const handleRefreshAssignments = useCallback(() => {
		void queryClient.invalidateQueries({
			queryKey: assignmentKeys.byUser(userAddress.toLowerCase()),
		})
	}, [queryClient, userAddress])

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			className="shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
			onClick={handleRefreshAssignments}
			aria-label="Refresh assignments"
		>
			{assignmentsFetching ? (
				<Loader2 className="size-4 animate-spin" />
			) : (
				<RefreshCwIcon className="size-4" />
			)}
		</Button>
	)
}
