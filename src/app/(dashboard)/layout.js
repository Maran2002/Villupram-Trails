import DashboardHeader from '@/components/dashboard/DashboardHeader'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-900">
      <DashboardHeader />
      <main>
        {children}
      </main>
    </div>
  )
}
