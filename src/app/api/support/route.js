import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function POST(req) {
  try {
    const { name, email, topic, message } = await req.json()

    // Validate the input
    if (!name || !email || !topic || !message) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields.' },
        { status: 400 }
      )
    }

    const db = await getDb()
    
    // Create support ticket document
    const newTicket = {
      name,
      email,
      topic,
      message,
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
