import { Providers } from './providers'
import VisitorTracker from '@/components/common/VisitorTracker'
import './globals.css'

export const metadata = {
  title: 'Villupuram Travel Community',
  description: 'Discover hidden gems across Villupuram District',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <VisitorTracker />
          {children}
        </Providers>
      </body>
    </html>
  )
}
