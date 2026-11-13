import DashboardHeader from '@/components/dashboard/DashboardHeader'

export const metadata = {
  title: { template: '%s | Dashboard | Oor Thadam', default: 'Dashboard | Oor Thadam' },
  robots: { index: false, follow: false },
}

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
