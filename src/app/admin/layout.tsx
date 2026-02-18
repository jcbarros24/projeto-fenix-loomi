import { Navbar } from '@/components/organisms/Navbar/navbar'

const amdinMenuItems = [
  {
    label: 'Home',
    href: '/admin/home',
  },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-5">
      <Navbar navItems={amdinMenuItems} />
      {children}
    </main>
  )
}
