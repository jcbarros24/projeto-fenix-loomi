'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { TicketsDataTable } from '@/components/organisms/TicketsDataTable/ticketsDataTable'
import { apiFetch } from '@/services/api'
import { TicketsApiResponse } from '@/types/ticket'

export default function TicketsPage() {
  const {
    data: tickets,
    isPending,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await apiFetch<TicketsApiResponse>('/tickets')
      console.log(response)
      return response
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  })

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
