import { Providers } from './providers'
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
          {children}
        </Providers>
      </body>
    </html>
  )
}
