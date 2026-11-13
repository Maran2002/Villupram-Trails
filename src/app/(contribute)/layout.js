export const metadata = {
  title: { template: '%s | Contribute | Oor Thadam', default: 'Contribute | Oor Thadam' },
  robots: { index: false, follow: false },
}

export default function ContributeLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-900">
      {children}
    </div>
  )
}
