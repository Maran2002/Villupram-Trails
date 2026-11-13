export const metadata = {
  title: { template: '%s | Account | Oor Thadam', default: 'Account | Oor Thadam' },
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-900">
      {children}
    </div>
  )
}
