import { Navbar } from '@/components/organisms/Navbar/navbar'

const authMenuItems = [
  {
    label: 'Home',
    href: '/home',
  },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-5">
      <Navbar navItems={authMenuItems} />
      {children}
    </main>
  )
}
