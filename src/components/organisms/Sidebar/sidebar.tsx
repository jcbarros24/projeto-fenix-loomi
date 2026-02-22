'use client'

import AnalyticsIcon from '@mui/icons-material/Analytics'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import ChatBubbleIcon from '@mui/icons-material/ChatBubbleOutline'
import CloseIcon from '@mui/icons-material/Close'
import ChecklistIcon from '@mui/icons-material/Checklist'
import { Calendar, TicketIcon, TrendingUpIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useSidebar } from '@/contexts/SidebarContext'
import { cn } from '@/lib/utils'

type SidebarItem = {
  label: string
  href: string
  icon: React.ReactNode
}

const items: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <AnalyticsIcon className="text-white" fontSize="small" />,
  },
  {
    label: 'Tickets',
    href: '/tickets',
    icon: <TicketIcon className="text-white" fontSize="small" />,
  },
  {
    label: 'Chat',
    href: '/chat',
    icon: <ChatBubbleIcon className="text-white" fontSize="small" />,
  },
  {
    label: 'Questionários',
    href: '/profile',
    icon: <ChecklistIcon className="text-white" fontSize="small" />,
  },
  {
    label: 'Simulador de Planos',
    href: '/simulator',
    icon: <Calendar className="text-white" fontSize="small" />,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { isExpanded, isMobileOpen, closeMobile } = useSidebar()

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col rounded-r-2xl bg-[#20273E] pb-8 pt-6 shadow-card-fade transition-all duration-300',
          isExpanded ? 'lg:w-64' : 'lg:w-28',
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72',
          'lg:translate-x-0',
        )}
      >
        <div className="mb-6 flex justify-end px-4 lg:hidden">
          <button
            type="button"
            className="rounded-md p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            onClick={closeMobile}
            aria-label="Fechar sidebar"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <div className="flex h-full flex-col justify-between">
          <div className="flex items-center justify-center">
            <Image
              src="/images/nortus-logo.png"
              alt="Nortus Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>

          <div className="flex w-full flex-col items-center gap-8">
            {items.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    boxShadow: isActive
                      ? '0 0 10px 0 rgba(24, 118, 210, 0.5)'
                      : 'none',
                  }}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-8 py-3 text-white transition-colors hover:bg-white/10',
                    isActive ? 'bg-[#1876D2] text-white' : 'bg-white/5',
                    isExpanded || isMobileOpen ? 'w-[90%]' : 'w-12 justify-center',
                  )}
                  aria-label={item.label}
                  title={!isExpanded && !isMobileOpen ? item.label : undefined}
                  onClick={closeMobile}
                >
                  <div className="flex h-10 w-10 items-center justify-center">
                    {item.icon}
                  </div>
                  {(isExpanded || isMobileOpen) && (
                    <span className="truncate text-sm font-medium">
                      {item.label}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          <div className="flex w-fit items-center justify-center self-center rounded-full bg-blue-600 px-4 py-3">
            <p className="text-lg font-medium text-white">JP</p>
          </div>
        </div>
      </aside>
    </>
  )
}
