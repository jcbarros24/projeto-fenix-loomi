'use client'

import { Search } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'

import Input from '@/components/atoms/Input/input'
import { DataTableSkeleton } from '@/components/organisms/DataTable/dataTableSkeleton'
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
import { DashboardResponse } from '@/types/dashboard'

type ActiveClient = NonNullable<
  NonNullable<DashboardResponse['activeClients']>['data']
>[number]

type ActiveClientsDataTableProps = {
  clients: ActiveClient[]
  isPending: boolean
  isFetching?: boolean
  isError?: boolean
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
})

const statusBadgeClass = (status?: string) => {
  const normalized = status?.toLowerCase() ?? ''

  if (normalized.includes('ativo')) return 'bg-cyan-400/90 text-slate-950'
  if (normalized.includes('pend')) return 'bg-amber-300/90 text-slate-950'
  if (normalized.includes('cancel')) return 'bg-rose-400/90 text-white'

  return 'bg-white/20 text-white'
}

export function ActiveClientsDataTable({
  clients,
  isPending,
  isFetching = false,
  isError = false,
}: ActiveClientsDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const statusOptions = useMemo(
    () =>
      Array.from(new Set(clients.map((client) => client.status))).filter(
        Boolean,
      ),
    [clients],
  )

  const typeOptions = useMemo(
    () =>
      Array.from(new Set(clients.map((client) => client.secureType))).filter(
        Boolean,
      ),
    [clients],
  )

  const regionOptions = useMemo(
    () =>
      Array.from(new Set(clients.map((client) => client.location))).filter(
        Boolean,
      ),
    [clients],
  )

  const filteredClients = useMemo(() => {
    const normalizedSearch = deferredSearchTerm.trim().toLowerCase()

    return clients.filter((client) => {
      const name = client.name ?? ''
      const email = client.email ?? ''
      const matchesSearch =
        !normalizedSearch ||
        name.toLowerCase().includes(normalizedSearch) ||
        email.toLowerCase().includes(normalizedSearch)

      const matchesStatus =
        statusFilter === 'all' || (client.status ?? '') === statusFilter
      const matchesType =
        typeFilter === 'all' || (client.secureType ?? '') === typeFilter
      const matchesRegion =
        regionFilter === 'all' || (client.location ?? '') === regionFilter

      return matchesSearch && matchesStatus && matchesType && matchesRegion
    })
  }, [clients, deferredSearchTerm, regionFilter, statusFilter, typeFilter])

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-lg">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-semibold text-white">Clientes ativos</h2>
        {isFetching && !isPending && (
          <span className="text-xs text-slate-300">Atualizando dados...</span>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="min-w-0 flex-1 basis-full sm:min-w-[200px] sm:basis-auto">
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nome ou email..."
            icon={<Search className="h-4 w-4" />}
            variant="dark"
            className="h-11 rounded-full border-white/10 !bg-[#0b0d1c] text-slate-100 placeholder:text-slate-500"
          />
        </div>

        <div className="min-w-0 flex-1 basis-full sm:basis-auto sm:flex-none sm:w-[170px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger variant="table">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent variant="table">
              <SelectItem value="all" variant="table">
                Todos os status
              </SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status as string} variant="table">
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 flex-1 basis-full sm:basis-auto sm:flex-none sm:w-[170px]">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger variant="table">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent variant="table">
              <SelectItem value="all" variant="table">
                Todos os tipos
              </SelectItem>
              {typeOptions.map((type) => (
                <SelectItem key={type} value={type as string} variant="table">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 flex-1 basis-full sm:basis-auto sm:flex-none sm:w-[170px]">
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger variant="table">
              <SelectValue placeholder="Todos os locais" />
            </SelectTrigger>
            <SelectContent variant="table">
              <SelectItem value="all" variant="table">
                Todos os locais
              </SelectItem>
              {regionOptions.map((region) => (
                <SelectItem
                  key={region}
                  value={region as string}
                  variant="table"
                >
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <Table className="text-slate-200">
          <TableHeader className="[&_tr]:border-white/10">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-slate-400">Nome</TableHead>
              <TableHead className="text-slate-400">Tipo de Seguro</TableHead>
              <TableHead className="text-slate-400">Valor mensal</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-slate-400">Renovação</TableHead>
              <TableHead className="text-slate-400">Região</TableHead>
            </TableRow>
          </TableHeader>

          {isPending ? (
            <DataTableSkeleton
              rows={6}
              columns={[
                { variant: 'double', widthClassName: 'w-32' },
                { variant: 'text', widthClassName: 'w-32' },
                { variant: 'text', widthClassName: 'w-20' },
                { variant: 'badge' },
                { variant: 'text', widthClassName: 'w-24' },
                { variant: 'text', widthClassName: 'w-24' },
              ]}
            />
          ) : (
            <TableBody>
              {isError ? (
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableCell
                    colSpan={6}
                    className="h-20 text-center text-slate-300"
                  >
                    Nao foi possivel carregar os clientes ativos.
                  </TableCell>
                </TableRow>
              ) : filteredClients.length ? (
                filteredClients.map((client, index) => (
                  <TableRow
                    key={client.id ?? `active-client-${index}`}
                    className="border-white/10 hover:bg-white/[0.02]"
                  >
                    <TableCell className="py-4">
                      <div className="font-medium text-white">
                        {client.name ?? '-'}
                      </div>
                      <div className="text-sm text-slate-400">
                        {client.email ?? '-'}
                      </div>
                    </TableCell>
                    <TableCell>{client.secureType ?? '-'}</TableCell>
                    <TableCell>
                      {currencyFormatter.format(client.monthValue ?? 0)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(client.status)}`}
                      >
                        {client.status ?? '-'}
                      </span>
                    </TableCell>
                    <TableCell>{client.renewalDate ?? '-'}</TableCell>
                    <TableCell>{client.location ?? '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableCell
                    colSpan={6}
                    className="h-20 text-center text-slate-300"
                  >
                    Nenhum cliente encontrado com os filtros selecionados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </div>
    </section>
  )
}
