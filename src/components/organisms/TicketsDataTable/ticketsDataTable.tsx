'use client'

import { useTranslations } from 'next-intl'
import {
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock3,
  PencilLine,
  Search,
  Ticket as TicketIcon,
  Timer,
} from 'lucide-react'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'

import Input from '@/components/atoms/Input/input'
import { DataTableSkeleton } from '@/components/organisms/DataTable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Ticket } from '@/types/ticket'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const statusBadgeClass = (status: string) => {
  const normalized = status.toLowerCase()

  if (normalized.includes('aberto')) return 'bg-cyan-400/90 text-slate-950'
  if (normalized.includes('andamento')) return 'bg-amber-300/90 text-slate-950'
  if (normalized.includes('fechado')) return 'bg-slate-300/90 text-slate-900'

  return 'bg-white/20 text-white'
}

const priorityBadgeClass = (priority: string) => {
  const normalized = priority.toLowerCase()

  if (normalized.includes('urg')) return 'bg-rose-500/90 text-white'
  if (normalized.includes('med') || normalized.includes('méd')) {
    return 'bg-sky-200/90 text-slate-900'
  }
  if (normalized.includes('baixa')) return 'bg-slate-100/90 text-slate-900'

  return 'bg-white/20 text-white'
}

type TicketsDataTableProps = {
  tickets: Ticket[]
  isPending: boolean
  isFetching?: boolean
  isError?: boolean
}

const PAGE_SIZE = 5

const parseTicketDate = (value: string) => {
  const parsedDate = new Date(value)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

const isToday = (date: Date) => {
  const now = new Date()
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  )
}

const formatAverageTime = (hours: number): string => {
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${minutes}min`
  }
  if (hours < 24) {
    return `${hours.toFixed(1)}h`
  }
  const days = Math.floor(hours / 24)
  const remainingHours = Math.round(hours % 24)
  if (remainingHours === 0) {
    return `${days}d`
  }
  return `${days}d ${remainingHours}h`
}

export function TicketsDataTable({
  tickets,
  isPending,
  isFetching = false,
  isError = false,
}: TicketsDataTableProps) {
  const t = useTranslations('tickets')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const ticketsList = useMemo(
    () => (Array.isArray(tickets) ? tickets : []),
    [tickets],
  )

  const statusOptions = useMemo(
    () =>
      Array.from(new Set(ticketsList.map((ticket) => ticket.status))).filter(
        Boolean,
      ),
    [ticketsList],
  )

  const priorityOptions = useMemo(
    () =>
      Array.from(new Set(ticketsList.map((ticket) => ticket.priority))).filter(
        Boolean,
      ),
    [ticketsList],
  )

  const filteredTickets = useMemo(() => {
    const normalizedSearch = deferredSearchTerm.trim().toLowerCase()

    return ticketsList.filter((ticket) => {
      const matchesSearch =
        !normalizedSearch ||
        ticket.ticketId.toLowerCase().includes(normalizedSearch) ||
        ticket.client.toLowerCase().includes(normalizedSearch) ||
        ticket.subject.toLowerCase().includes(normalizedSearch)

      const matchesStatus =
        statusFilter === 'all' || ticket.status === statusFilter
      const matchesPriority =
        typeFilter === 'all' || ticket.priority === typeFilter
      const matchesResponsible =
        regionFilter === 'all' || ticket.responsible === regionFilter

      return (
        matchesSearch && matchesStatus && matchesPriority && matchesResponsible
      )
    })
  }, [deferredSearchTerm, regionFilter, statusFilter, ticketsList, typeFilter])

  const ticketMetrics = useMemo(() => {
    const openCount = ticketsList.filter((ticket) =>
      ticket.status.toLowerCase().includes('aberto'),
    ).length

    const inProgressCount = ticketsList.filter((ticket) =>
      ticket.status.toLowerCase().includes('andamento'),
    ).length

    const resolvedToday = ticketsList.filter((ticket) => {
      const normalizedStatus = ticket.status.toLowerCase()
      const isResolved =
        normalizedStatus.includes('fechado') ||
        normalizedStatus.includes('resolvido')
      if (!isResolved) return false

      const ticketDate = parseTicketDate(ticket.createdAt)
      return ticketDate ? isToday(ticketDate) : false
    }).length

    const hoursSamples = ticketsList
      .filter((ticket) => {
        const normalizedStatus = ticket.status.toLowerCase()
        return (
          normalizedStatus.includes('fechado') ||
          normalizedStatus.includes('resolvido')
        )
      })
      .map((ticket) => {
        const created = parseTicketDate(ticket.createdAt)
        const updated = parseTicketDate(ticket.updatedAt)
        if (!created || !updated) return null
        return Math.max(0, (updated.getTime() - created.getTime()) / 3_600_000)
      })
      .filter((h): h is number => typeof h === 'number')

    const averageHours =
      hoursSamples.length > 0
        ? hoursSamples.reduce((sum, h) => sum + h, 0) / hoursSamples.length
        : 0

    return {
      openCount,
      inProgressCount,
      resolvedToday,
      averageHours,
    }
  }, [ticketsList])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredTickets.length / PAGE_SIZE)),
    [filteredTickets.length],
  )

  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE
    return filteredTickets.slice(startIndex, startIndex + PAGE_SIZE)
  }, [currentPage, filteredTickets])

  useEffect(() => {
    setCurrentPage(1)
  }, [deferredSearchTerm, regionFilter, statusFilter, typeFilter])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  return (
    <div className="space-y-6">
      <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isPending
          ? Array.from({ length: 4 }).map((_, index) => (
              <article
                key={`ticket-card-skeleton-${index}`}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
                <div className="mt-4 h-7 w-10 animate-pulse rounded bg-white/15" />
                <div className="mt-3 h-4 w-5 animate-pulse rounded bg-white/10" />
              </article>
            ))
          : [
              {
                label: t('openTickets'),
                value: ticketMetrics.openCount,
                icon: <TicketIcon className="h-4 w-4 text-cyan-300" />,
              },
              {
                label: t('inProgress'),
                value: ticketMetrics.inProgressCount,
                icon: <Clock3 className="h-4 w-4 text-amber-300" />,
              },
              {
                label: t('resolvedToday'),
                value: ticketMetrics.resolvedToday,
                icon: <CheckCheck className="h-4 w-4 text-cyan-300" />,
              },
              {
                label: t('averageTime'),
                value: formatAverageTime(ticketMetrics.averageHours),
                icon: <Timer className="h-4 w-4 text-blue-300" />,
              },
            ].map((card) => (
              <article
                key={card.label}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
              >
                <p className="text-sm text-slate-300">{card.label}</p>
                <div className="mt-3 flex items-end justify-between">
                  <p className="text-3xl font-semibold text-white">
                    {card.value}
                  </p>
                  <div className="rounded-md border border-white/10 p-1.5">
                    {card.icon}
                  </div>
                </div>
              </article>
            ))}
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-semibold text-white">
            {t('listTitle')}
          </h2>
          {isFetching && !isPending && (
            <span className="text-xs text-slate-300">{t('updating')}</span>
          )}
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <div className="min-w-0 flex-1 basis-full sm:basis-auto sm:min-w-[200px]">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={t('searchPlaceholder')}
              icon={<Search className="h-4 w-4" />}
              variant="dark"
              className="h-11 rounded-full border-white/10 !bg-[#0b0d1c] text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div className="min-w-0 flex-1 basis-full sm:basis-auto sm:flex-none sm:w-[170px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger variant="table">
                <SelectValue placeholder={t('allStatus')} />
              </SelectTrigger>
              <SelectContent variant="table">
                <SelectItem value="all" variant="table">
                  {t('allStatus')}
                </SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status} variant="table">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-0 flex-1 basis-full sm:basis-auto sm:flex-none sm:w-[170px]">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger variant="table">
                <SelectValue placeholder={t('allPriorities')} />
              </SelectTrigger>
              <SelectContent variant="table">
                <SelectItem value="all" variant="table">
                  {t('allPriorities')}
                </SelectItem>
                {priorityOptions.map((priority) => (
                  <SelectItem key={priority} value={priority} variant="table">
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-0 flex-1 basis-full sm:basis-auto sm:flex-none sm:w-[170px]">
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger variant="table">
                <SelectValue placeholder="Todos os responsáveis" />
              </SelectTrigger>
              <SelectContent variant="table">
                <SelectItem value="all" variant="table">
                  {t('allResponsibles')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <Table className="text-slate-200">
            <TableHeader className="[&_tr]:border-white/10">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-slate-400">{t('id')}</TableHead>
                <TableHead className="text-slate-400">{t('priority')}</TableHead>
                <TableHead className="text-slate-400">{t('client')}</TableHead>
                <TableHead className="text-slate-400">{t('subject')}</TableHead>
                <TableHead className="text-slate-400">{t('status')}</TableHead>
                <TableHead className="text-slate-400">{t('createdAt')}</TableHead>
                <TableHead className="text-slate-400">
                  {t('responsible')}
                </TableHead>
                <TableHead className="text-slate-400">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>

            {isPending ? (
              <DataTableSkeleton
                rows={PAGE_SIZE}
                columns={[
                  { variant: 'text', widthClassName: 'w-16' },
                  { variant: 'badge' },
                  { variant: 'double', widthClassName: 'w-28' },
                  { variant: 'text', widthClassName: 'w-36' },
                  { variant: 'badge' },
                  { variant: 'text', widthClassName: 'w-20' },
                  { variant: 'text', widthClassName: 'w-24' },
                  { variant: 'actions' },
                ]}
              />
            ) : (
              <TableBody>
                {isError ? (
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableCell
                      colSpan={8}
                      className="h-20 text-center text-slate-300"
                    >
                      {t('loadError')}
                    </TableCell>
                  </TableRow>
                ) : paginatedTickets.length ? (
                  paginatedTickets.map((ticket) => (
                    <TableRow
                      key={ticket.ticketId}
                      className="border-white/10 hover:bg-white/[0.02]"
                    >
                      <TableCell className="font-semibold text-slate-200">
                        {ticket.ticketId}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${priorityBadgeClass(ticket.priority)}`}
                        >
                          {ticket.priority}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="font-medium text-white">
                          {ticket.client}
                        </div>
                        <div className="text-sm text-slate-400">
                          {ticket.email}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate">
                        {ticket.subject}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(ticket.status)}`}
                        >
                          {ticket.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {format(ticket.createdAt, 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>{ticket.responsible}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1"
                          >
                            Editar
                            <PencilLine className="h-3.5 w-3.5 text-blue-400" />
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1"
                          >
                            {t('view')}
                            <ChevronRight className="h-3.5 w-3.5 text-blue-400" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableCell
                      colSpan={8}
                      className="h-20 text-center text-slate-300"
                    >
                      {t('noTickets')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            )}
          </Table>
        </div>

        {!isPending && filteredTickets.length > 0 && (
          <div className="mt-4 flex items-center justify-end gap-3 text-slate-300">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="rounded p-1 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Primeira página"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentPage((previous) => Math.max(1, previous - 1))
              }
              disabled={currentPage === 1}
              className="rounded p-1 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-16 text-center text-sm">
              {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setCurrentPage((previous) => Math.min(totalPages, previous + 1))
              }
              disabled={currentPage === totalPages}
              className="rounded p-1 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="rounded p-1 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Última página"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
