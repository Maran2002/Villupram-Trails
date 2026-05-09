import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function POST(req) {
  try {
    const { email } = await req.json()

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    const db = await getDb()
    
    // Check if email already exists
    const existingSubscriber = await db.collection('newsletter_subscribers').findOne({ email: email.toLowerCase() })
    
    if (existingSubscriber) {
      return NextResponse.json(
        { success: false, message: 'You are already subscribed!' },
        { status: 409 }
      )
    }

    // Insert new subscriber
    await db.collection('newsletter_subscribers').insertOne({
      email: email.toLowerCase(),
      subscribedAt: new Date(),
      status: 'active'
    })

    return NextResponse.json(
      { success: true, message: 'Successfully subscribed to the newsletter!' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
