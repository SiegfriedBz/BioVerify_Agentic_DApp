import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState
} from '@tanstack/react-table'
import {
  useQueryStates,
  type ParserMap,
  type UseQueryStatesOptions
} from 'nuqs'
import { useCallback } from 'react'

export function useDataTableUrlState<T extends ParserMap>(
  parsers: T,
  options?: Partial<UseQueryStatesOptions<T>>
) {
  const [urlState, setUrlState] = useQueryStates(parsers, {
    shallow: false,
    history: 'push',
    ...options,
    urlKeys: options?.urlKeys ?? {}
  } as UseQueryStatesOptions<T>)

  const onPaginationChange: OnChangeFn<PaginationState> = useCallback((updater) => {
    const current = {
      pageIndex: (urlState.pageIndex as number) ?? 0,
      pageSize: (urlState.pageSize as number) ?? 10
    }
    const next = typeof updater === 'function' ? updater(current) : updater
    setUrlState({
      pageIndex: next.pageIndex,
      pageSize: next.pageSize
    } as any)
  }, [urlState, setUrlState])

  const onSortingChange: OnChangeFn<SortingState> = useCallback((updater) => {
    const current = (urlState.sort as SortingState) ?? []
    const next = typeof updater === 'function' ? updater(current) : updater
    setUrlState({ sort: next } as any)
  }, [urlState, setUrlState])

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = useCallback((updater) => {
    const current = (urlState.filters as any[]) ?? []
    const next = typeof updater === 'function' ? updater(current) : updater

    // Flatten the nested Niko Object if necessary
    const flattened = next.map((f: any) => {
      if (f.value && typeof f.value === 'object' && 'id' in f.value) {
        return f.value
      }
      return f
    })

    setUrlState({ filters: flattened, pageIndex: 0 } as any)
  }, [urlState, setUrlState])

  return {
    urlState,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
  }
}