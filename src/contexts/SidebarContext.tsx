'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface SidebarContextType {
  isExpanded: boolean
  isMobileOpen: boolean
  toggleExpanded: () => void
  toggleMobile: () => void
  closeMobile: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

interface SidebarProviderProps {
  children: ReactNode
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleExpanded = () => {
    setIsExpanded((previous) => !previous)
  }

  const toggleMobile = () => {
    setIsMobileOpen((previous) => !previous)
  }

  const closeMobile = () => {
    setIsMobileOpen(false)
  }

  return (
    <SidebarContext.Provider
      value={{
        isExpanded,
        isMobileOpen,
        toggleExpanded,
        toggleMobile,
        closeMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
