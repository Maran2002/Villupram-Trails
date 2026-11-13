import { Providers } from './providers'
import VisitorTracker from '@/components/common/VisitorTracker'
import './globals.css'

const metadataBase = (() => {
  try {
    return process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined
  } catch {
    return undefined
  }
})()

export const metadata = {
  ...(metadataBase ? { metadataBase } : {}),
  title: {
    default: 'Oor Thadam',
    template: '%s | Oor Thadam',
  },
  description: 'Discover destinations, heritage, nature and local travel experiences across Villupuram District, Tamil Nadu.',
  applicationName: 'Oor Thadam',
  openGraph: {
    type: 'website',
    siteName: 'Oor Thadam',
    title: 'Oor Thadam',
    description: 'Discover destinations and local travel experiences across Villupuram District, Tamil Nadu.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oor Thadam',
    description: 'Discover destinations and local travel experiences across Villupuram District, Tamil Nadu.',
  },
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
