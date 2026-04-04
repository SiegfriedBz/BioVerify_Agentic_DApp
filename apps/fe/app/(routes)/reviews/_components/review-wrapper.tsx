import { redirect } from "next/navigation"
import { type FC, Suspense } from "react"
import { getAuthFromCookies } from "@/_services/wagmi/get-auth-from-cookies"
import { ReviewerAssignmentsSkeleton } from "./reviewer-assignments-skeleton"
import { ReviewerAssignmentsWrapper } from "./reviewer-assignments-wrapper"
import { ReviewerStatsSkeleton } from "./reviewer-stats-skeleton"
import { ReviewerStatsWrapper } from "./reviewer-stats-wrapper"

export const ReviewWrapper: FC = async () => {
	const { userAddress, chainId } = await getAuthFromCookies()

	if (!userAddress || !chainId) {
		redirect("/")
	}

	return (
		<div className="space-y-12">
			<Suspense fallback={<ReviewerStatsSkeleton />}>
				<ReviewerStatsWrapper
					server={{
						userAddress,
						chainId,
					}}
				/>
			</Suspense>

			<Suspense fallback={<ReviewerAssignmentsSkeleton />}>
				<ReviewerAssignmentsWrapper
					server={{
						userAddress,
						chainId,
					}}
				/>
			</Suspense>
		</div>
	)
}
