import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function POST(req) {
  try {
    const { name, email, topic, message } = await req.json()

    // Validate the input
    if (typeof name !== 'string' || !name.trim() || name.length > 100
      || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254
      || typeof topic !== 'string' || !topic.trim() || topic.length > 120
      || typeof message !== 'string' || !message.trim() || message.length > 5000) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields.' },
        { status: 400 }
      )
    }

    const db = await getDb()
    
    // Create support ticket document
    const newTicket = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      topic: topic.trim(),
      message: message.trim(),
      status: 'open', // open, in-progress, closed
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insert into 'support_tickets' collection
    const result = await db.collection('support_tickets').insertOne(newTicket)

    return NextResponse.json(
      { success: true, data: { id: result.insertedId } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Support ticket creation error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to submit support request.' },
      { status: 500 }
    )
  }
}
