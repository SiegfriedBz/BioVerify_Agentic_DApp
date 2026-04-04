import type { Publication } from "@packages/schema"
import type { SortingState } from "@tanstack/react-table"
import {
	createSearchParamsCache,
	parseAsInteger,
	parseAsJson,
} from "nuqs/server"
import type { ExtendedColumnFilter } from "@/components/niko-table/types"

export const parsers = {
	pageIndex: parseAsInteger.withDefault(0),
	pageSize: parseAsInteger.withDefault(10),
	sort: parseAsJson<SortingState>((v) => v as SortingState).withDefault([]),
	filters: parseAsJson<ExtendedColumnFilter<Publication>[]>(
		(v) => v as ExtendedColumnFilter<Publication>[],
	).withDefault([]),
}

export const searchParamsCache = createSearchParamsCache(parsers)
