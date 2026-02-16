'use client'

import { Navbar } from '@/components/organisms/Navbar/navbar'
import RouteGuard from '@/router'

const authMenuItems = [
  {
    label: 'Home',
    href: '/home',
  },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard accessType="authenticated">
      <main className="flex h-screen w-full flex-col items-center justify-center gap-5">
        <Navbar navItems={authMenuItems} />
        {children}
      </main>
    </RouteGuard>
  )
}
