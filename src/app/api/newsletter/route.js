import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function POST(req) {
  try {
    const body = await req.json()
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || email.length > 254 || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    const db = await getDb()
    
    // Check if email already exists
    const existingSubscriber = await db.collection('newsletter_subscribers').findOne({ email })
    
    if (existingSubscriber) {
      return NextResponse.json(
        { success: false, message: 'This email is already on the community updates list.' },
        { status: 409 }
      )
    }

    // Insert new subscriber
    await db.collection('newsletter_subscribers').insertOne({
      email,
      subscribedAt: new Date(),
      status: 'active',
    })

    return NextResponse.json(
      { success: true, message: 'Your email has been added to the community updates list.' },
      { status: 201 }
    )
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'This email is already on the updates list.' },
        { status: 409 }
      )
    }
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
