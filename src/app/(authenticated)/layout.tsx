'use client'

import MenuIcon from '@mui/icons-material/Menu'
import { PlusIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { CreateTicketModal } from '@/components/organisms/Modals/CreateTicketModal/createTicketModal'
import Sidebar from '@/components/organisms/Sidebar/sidebar'
import { Button } from '@/components/ui/button'
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext'
import { cn } from '@/lib/utils'
import {
  useCreateTicket,
  useTicketsForModal,
} from '@/hooks/queries'
import { AuthBlocker } from '@/shared/components/auth-blocker'
import { Ticket } from '@/types/ticket'

function getNextTicketId(tickets: Ticket[]): string {
  const numbers = tickets
    .map((t) => {
      const match = t.ticketId.match(/TK-?(\d+)/i)
      return match ? parseInt(match[1], 10) : 0
    })
    .filter((n) => !Number.isNaN(n))
  const max = numbers.length > 0 ? Math.max(...numbers) : 0
  return `TK${max + 1}`
}

function pageTitleMapping(pathname: string) {
  switch (pathname) {
    case '/tickets':
      return 'Gestão de Tickets'
    case '/chat':
      return 'Chat & Assistente Virtual'
    case '/profile':
      return 'Perfil'
    case '/simulator':
      return 'Simulador de Planos'
    default:
      return 'Dashboard'
  }
}
function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isExpanded, toggleMobile } = useSidebar()
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false)
  const pageTitle = pageTitleMapping(pathname)
  const isTicketsRoute = pathname === '/tickets'

  const { data: ticketsData } = useTicketsForModal(isCreateTicketOpen)
  const nextTicketId = useMemo(
    () => getNextTicketId(ticketsData?.data ?? []),
    [ticketsData?.data],
  )

  const createTicketMutation = useCreateTicket({
    onSuccess: () => {
      toast.success('Ticket criado com sucesso!')
      setIsCreateTicketOpen(false)
    },
    onError: (error) => {
      toast.error('Não foi possível criar o ticket.', {
        description: error.message,
      })
    },
  })

  return (
    <div className="min-h-screen w-full bg-background">
      <Sidebar />

      <div
        className={cn(
          'w-full transition-[padding] duration-300',
          isExpanded ? 'lg:pl-64' : 'lg:pl-28',
        )}
      >
        <header className="sticky top-0 z-30 flex w-full items-center justify-between bg-[#20273E] py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md p-2 text-white/80 transition hover:bg-white/10 hover:text-white lg:hidden"
              onClick={toggleMobile}
              aria-label="Abrir menu lateral"
            >
              <MenuIcon fontSize="small" />
            </button>
            <p className="font-sans font-semibold text-gray-primary">
              {pageTitle}
            </p>
          </div>

          {isTicketsRoute && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsCreateTicketOpen(true)}
              style={{ boxShadow: '0 0 10px 0 rgba(24, 118, 210, 0.5)' }}
            >
              <PlusIcon /> Novo Ticket
            </Button>
          )}
        </header>

        <main className="min-h-[calc(100vh-64px)] w-full px-4 pb-8 pt-6 sm:px-6">
          {children}
        </main>
      </div>

      <CreateTicketModal
        isOpen={isCreateTicketOpen}
        setIsOpen={setIsCreateTicketOpen}
        nextTicketId={nextTicketId}
        onSubmit={async (payload) => {
          await createTicketMutation.mutateAsync(payload)
        }}
        loading={createTicketMutation.isPending}
      />
    </div>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthBlocker>
      <SidebarProvider>
        <AuthenticatedShell>{children}</AuthenticatedShell>
      </SidebarProvider>
    </AuthBlocker>
  )
}
