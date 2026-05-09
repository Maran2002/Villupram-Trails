import { Button } from '@/components/common/Button'

export function CallToAction() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 text-center bg-primary-900 text-white">
      <h2 className="text-4xl font-serif font-bold mb-4">Join Our Community</h2>
      <p className="mb-8 max-w-lg mx-auto">Start contributing and sharing your local knowledge today.</p>
      <Button variant="primary" size="lg" className="bg-white text-primary-900 hover:bg-neutral-100">Get Started</Button>
    </section>
  )
}
