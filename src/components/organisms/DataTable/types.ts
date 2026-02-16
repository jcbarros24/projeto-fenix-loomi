import { ColumnDef } from '@tanstack/react-table'

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  actionsColumn?: ColumnDef<TData, TValue>
  tableTitle?: string
  tableDescription?: string
  mainAction?: React.ReactNode
  searchColumn?: string
  searchInputPlaceholder?: string
}
