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
    default: 'Villupuram Trails',
    template: '%s | Villupuram Trails',
  },
  description: 'Discover destinations, heritage, nature and local travel experiences across Villupuram District, Tamil Nadu.',
  applicationName: 'Villupuram Trails',
  openGraph: {
    type: 'website',
    siteName: 'Villupuram Trails',
    title: 'Villupuram Trails',
    description: 'Discover destinations and local travel experiences across Villupuram District, Tamil Nadu.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Villupuram Trails',
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
