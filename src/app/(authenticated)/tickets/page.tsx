'use client'

import { keepPreviousData } from '@tanstack/react-query'

import { TicketsDataTable } from '@/components/organisms/TicketsDataTable/ticketsDataTable'
import { useTickets } from '@/hooks/queries'

export default function TicketsPage() {
  const {
    data: tickets,
    isPending,
    isFetching,
    isError,
  } = useTickets({ placeholderData: keepPreviousData })

  return (
    <div className="flex w-full flex-col gap-6 pb-10">
      <TicketsDataTable
        tickets={tickets?.data ?? []}
        isPending={isPending}
        isFetching={isFetching}
        isError={isError}
      />
    </div>
  )
}
