'use client'

import { usePathname } from 'next/navigation'

import { Sidebar } from '@/components/organisms/Sidebar/sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="items-center bg-slate-800 px-6 py-6 lg:pl-72">
        <p className="text-gray-primary font-sans font-semibold">
          {pathname.split('/')[1]?.charAt(0).toUpperCase() +
            pathname.split('/')[1]?.slice(1).toLowerCase()}
        </p>
      </div>
      <main className="min-h-screen px-6 pb-8 pt-20 lg:pl-72 lg:pt-8">
        {children}
      </main>
    </div>
  )
}
