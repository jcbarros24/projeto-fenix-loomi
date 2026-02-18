export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex w-full flex-col items-center justify-center gap-5">
      {children}
    </main>
  )
}
