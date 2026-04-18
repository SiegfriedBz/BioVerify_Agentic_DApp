"use client"

import type { Publication } from "@packages/schema"
import { InboxIcon } from "lucide-react"
import type { FC } from "react"
import { useMemberAssignments } from "@/_hooks/cqrs/queries/use-member-assignments"
import { DataTablePagination } from "@/components/niko-table/components"
import {
	DataTable,
	DataTableBody,
	DataTableEmptyBody,
	DataTableHeader,
	DataTableRoot,
} from "@/components/niko-table/core"
import { Button } from "@/components/ui/button"
import { useColumns } from "./use-columns"

type Props = {
	userAddress: string
}

export const ReviewerTable: FC<Props> = (props) => {
	const { userAddress } = props
	const columns = useColumns({ userAddress })

	const {
		data: assignmentsResponse,
		isError,
		isFetching,
		refetch,
	} = useMemberAssignments({
		userAddress,
	})

	if (isError) {
		return (
			<div className="rounded-xl border border-border/40 bg-card/50 p-6 text-center text-sm text-muted-foreground">
				Failed to load assignments.{" "}
				<Button
					type="button"
					className="cursor-pointer font-semibold text-primary underline"
					onClick={() => void refetch()}
				>
					Retry
				</Button>
			</div>
		)
	}

	if (assignmentsResponse === undefined && isFetching) {
		return <div className="h-40 w-full animate-pulse rounded-xl bg-muted" />
	}

	const totalCount = assignmentsResponse?.totalCount ?? 0
	const assignments = assignmentsResponse?.items ?? []

	if (totalCount === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/40 bg-muted/5 py-20">
				<div className="mb-4 rounded-full bg-muted/20 p-4">
					<InboxIcon className="size-12 text-muted-foreground/40" />
				</div>
				<p className="font-semibold text-muted-foreground">
					Waiting for Assignments
				</p>
				<p className="mt-1 max-w-70 text-center text-sm text-muted-foreground/60">
					You are in the active reviewer pool. New publications will appear here
					when you are assigned.
				</p>
			</div>
		)
	}

	return (
		<DataTableRoot columns={columns} data={assignments}>
			<DataTable>
				<DataTableHeader />
				<DataTableBody<Publication>>
					<DataTableEmptyBody />
				</DataTableBody>
			</DataTable>

			<DataTablePagination totalCount={totalCount} />
		</DataTableRoot>
	)
}
