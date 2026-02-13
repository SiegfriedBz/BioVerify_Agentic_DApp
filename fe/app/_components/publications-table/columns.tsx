import {
  DataTableColumnDateFilterMenu,
  DataTableColumnFacetedFilterMenu,
  DataTableColumnHeader,
  DataTableColumnSliderFilterMenu,
  DataTableColumnSortMenu,
  DataTableColumnTitle,
} from "@/components/niko-table/components"
import { FILTER_VARIANTS } from "@/components/niko-table/lib"
import type { DataTableColumnDef } from "@/components/niko-table/types"

export type Product = {
  id: string
  name: string
  category: string
  brand: string
  price: number
  stock: number
  rating: number
  inStock: boolean
  releaseDate: Date
}

export const categoryOptions = [
  { label: "Electronics", value: "electronics" },
  { label: "Clothing", value: "clothing" },
  { label: "Sports", value: "sports" },
]

export const columns: DataTableColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: () => (
      <DataTableColumnHeader>
        <DataTableColumnTitle />
        <DataTableColumnSortMenu />
      </DataTableColumnHeader>
    ),
    meta: { label: "Product Name" },
  },
  {
    accessorKey: "category",
    header: () => (
      <DataTableColumnHeader>
        <DataTableColumnTitle />
        <DataTableColumnSortMenu variant={FILTER_VARIANTS.TEXT} />
        <DataTableColumnFacetedFilterMenu
          multiple
          limitToFilteredRows={false}
        />
      </DataTableColumnHeader>
    ),
    meta: {
      label: "Category",
      options: categoryOptions,
      mergeStrategy: "augment",
      dynamicCounts: true,
      showCounts: true,
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "brand",
    header: () => (
      <DataTableColumnHeader>
        <DataTableColumnTitle />
        <DataTableColumnSortMenu variant={FILTER_VARIANTS.TEXT} />
        <DataTableColumnFacetedFilterMenu limitToFilteredRows />
      </DataTableColumnHeader>
    ),
    meta: {
      label: "Brand",
      autoOptions: true,
      dynamicCounts: true,
      showCounts: true,
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "price",
    header: () => (
      <DataTableColumnHeader>
        <DataTableColumnTitle />
        <DataTableColumnSortMenu variant={FILTER_VARIANTS.NUMBER} />
        <DataTableColumnSliderFilterMenu />
      </DataTableColumnHeader>
    ),
    meta: {
      label: "Price",
      unit: "$",
      variant: "range",
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "releaseDate",
    header: () => (
      <DataTableColumnHeader>
        <DataTableColumnTitle />
        <DataTableColumnSortMenu />
        <DataTableColumnDateFilterMenu />
      </DataTableColumnHeader>
    ),
    meta: {
      label: "Release Date",
      variant: "date_range",
    },
    enableColumnFilter: true,
  },
]