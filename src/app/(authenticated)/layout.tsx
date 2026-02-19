import { Sidebar } from '@/components/organisms/Sidebar/sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="min-h-screen px-6 pb-8 pt-20 lg:pl-72 lg:pt-8">
        {children}
      </main>
    </div>
  )
}
