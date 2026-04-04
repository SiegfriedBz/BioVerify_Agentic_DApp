import type {
	ColumnFiltersState,
	OnChangeFn,
	PaginationState,
	SortingState,
} from "@tanstack/react-table"
import {
	type ParserMap,
	type UseQueryStatesOptions,
	useQueryStates,
	type Values,
} from "nuqs"
import { useCallback } from "react"

type TableUpdates<T extends ParserMap> = Partial<Values<T>> & {
	pageIndex?: number
	pageSize?: number
	sort?: SortingState
	filters?: ColumnFiltersState
}

export function useDataTableUrlState<T extends ParserMap>(
	parsers: T,
	options?: Partial<UseQueryStatesOptions<T>>,
) {
	const [urlState, setUrlState] = useQueryStates(parsers, {
		shallow: false,
		history: "push",
		...options,
		urlKeys: options?.urlKeys ?? {},
	})

	const onPaginationChange: OnChangeFn<PaginationState> = useCallback(
		(updater) => {
			const current = {
				pageIndex: (urlState.pageIndex as number) ?? 0,
				pageSize: (urlState.pageSize as number) ?? 10,
			}
			const next = typeof updater === "function" ? updater(current) : updater

			void setUrlState({
				pageIndex: next.pageIndex,
				pageSize: next.pageSize,
			} as TableUpdates<T>)
		},
		[urlState.pageIndex, urlState.pageSize, setUrlState],
	)

	const onSortingChange: OnChangeFn<SortingState> = useCallback(
		(updater) => {
			const current = (urlState.sort as SortingState) ?? []
			const next = typeof updater === "function" ? updater(current) : updater

			void setUrlState({ sort: next } as TableUpdates<T>)
		},
		[urlState.sort, setUrlState],
	)

	const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = useCallback(
		(updater) => {
			const current = (urlState.filters as ColumnFiltersState) ?? []
			const next = typeof updater === "function" ? updater(current) : updater

			// Flatten the nested Object if necessary
			const flattened = next.map((f) => {
				if (f.value && typeof f.value === "object" && "id" in f.value) {
					return f.value as { id: string; value: unknown }
				}
				return f
			}) as ColumnFiltersState

			void setUrlState({
				filters: flattened,
				pageIndex: 0,
			} as TableUpdates<T>)
		},
		[urlState.filters, setUrlState],
	)

	return {
		urlState,
		onPaginationChange,
		onSortingChange,
		onColumnFiltersChange,
	}
}
