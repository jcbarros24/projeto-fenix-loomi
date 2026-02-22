'use client'

import { TableBody, TableCell, TableRow } from '@/components/ui/table'

type SkeletonColumnVariant = 'text' | 'double' | 'badge' | 'actions'

type SkeletonColumn = {
  variant?: SkeletonColumnVariant
  widthClassName?: string
}

type DataTableSkeletonProps = {
  rows?: number
  columns: SkeletonColumn[]
}

export function DataTableSkeleton({ rows = 5, columns }: DataTableSkeletonProps) {
  return (
    <TableBody>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={`table-skeleton-row-${rowIndex}`} className="border-white/10">
          {columns.map((column, columnIndex) => {
            const widthClassName = column.widthClassName ?? 'w-24'

            return (
              <TableCell key={`table-skeleton-cell-${rowIndex}-${columnIndex}`}>
                {column.variant === 'double' ? (
                  <div className="space-y-2">
                    <div
                      className={`h-4 animate-pulse rounded bg-white/15 ${widthClassName}`}
                    />
                    <div className="h-3 w-40 animate-pulse rounded bg-white/10" />
                  </div>
                ) : column.variant === 'badge' ? (
                  <div className="h-6 w-20 animate-pulse rounded-full bg-white/10" />
                ) : column.variant === 'actions' ? (
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-10 animate-pulse rounded bg-white/10" />
                    <div className="h-4 w-8 animate-pulse rounded bg-white/10" />
                  </div>
                ) : (
                  <div
                    className={`h-4 animate-pulse rounded bg-white/10 ${widthClassName}`}
                  />
                )}
              </TableCell>
            )
          })}
        </TableRow>
      ))}
    </TableBody>
  )
}
