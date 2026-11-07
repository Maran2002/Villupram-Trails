import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata = {
  title: { default: 'Discover Villupuram', template: '%s | Villupuram Trails' },
  description: 'Explore Villupuram District destinations, cultural heritage, nature spots and community travel information.',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
}

export default function UserLayout({ children }) {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  )
}
