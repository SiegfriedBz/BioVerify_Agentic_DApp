"use client"

import type { MemberAssignments } from "@packages/cqrs"
import { ClipboardListIcon, InboxIcon } from "lucide-react"
import type { FC } from "react"
import { useMemberAssignments } from "@/_hooks/cqrs/queries/use-member-assignments"
import { useMemberByChain } from "@/_hooks/cqrs/queries/use-member-by-chain"
import { useAuthFromWallet } from "@/_hooks/use-auth-from-wallet"
import { FetchError } from "@/app/_components/fetch-error"
import { ReviewerTable } from "./table/reviewer-table"

type Props = {
	server: {
		initialData: MemberAssignments
		userAddress: string
		chainId: number
	}
}

export const ReviewerAssignmentsContainer: FC<Props> = (props) => {
	const { server } = props
	const { walletAddress, walletChainId } = useAuthFromWallet()

	const activeAddress = walletAddress || server.userAddress
	const activeChainId = walletChainId || server.chainId

	// 1. Fetch member data
	const { data: memberData } = useMemberByChain({
		userAddress: activeAddress,
		chainId: activeChainId,
	})

	const {
		data: assignmentsData,
		isError,
		refetch,
	} = useMemberAssignments({
		userAddress: activeAddress,
		initialData:
			activeAddress.toLowerCase() === server.userAddress.toLowerCase()
				? server.initialData
				: undefined,
	})

	if (isError) return <FetchError refetch={refetch} />

	// 2. Hide Assignments for non-members
	if (!memberData) return null

	const assignments = assignmentsData ?? []
	const count = assignments.length

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2">
				<ClipboardListIcon className="w-5 h-5 text-primary" />
				<h3 className="text-xl font-bold tracking-tight">Active Assignments</h3>
			</div>

			{count > 0 ? (
				<ReviewerTable
					assignments={assignments}
					count={count}
					userAddress={activeAddress}
				/>
			) : (
				<div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-2xl bg-muted/5">
					<div className="p-4 rounded-full bg-muted/20 mb-4">
						<InboxIcon className="size-12 text-muted-foreground/40" />
					</div>
					<p className="font-semibold text-muted-foreground">Standing By</p>
					<p className="text-sm text-muted-foreground/60 max-w-70 text-center mt-1">
						You are currently in the active pool.
						<span className="inline-flex">
							New publications will appear here when assigned.
						</span>
					</p>
				</div>
			)}
		</div>
	)
}
