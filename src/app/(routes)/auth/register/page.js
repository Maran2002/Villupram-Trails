'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { register, isLoading } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(email, password, username)
      toast.success('Registration successful!')
      router.push('/admin')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-serif font-bold text-center mb-6 text-neutral-900 dark:text-white">Join the Community</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">Username</label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-neutral-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-neutral-900 dark:text-white px-4 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">Email</label>
            <input
              type="email"
              required
              className="w-full rounded-lg border border-neutral-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-neutral-900 dark:text-white px-4 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">Password</label>
            <input
              type="password"
              required
              className="w-full rounded-lg border border-neutral-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-neutral-900 dark:text-white px-4 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" fullWidth isLoading={isLoading} size="lg">
            Create Account
          </Button>
        </form>
        <p className="text-center mt-4 text-sm text-neutral-600 dark:text-neutral-400">
          Already have an account? <Link href="/auth/login" className="text-primary-500 hover:underline">Log in</Link>
        </p>
      </Card>
    </div>
  )
}
