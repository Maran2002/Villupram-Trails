const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv')
const path = require('path')

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const uri = process.env.MONGODB_URI
if (!uri) throw new Error('Please add your Mongo URI to .env.local')

async function seed() {
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db('villupuram_db')

    console.log('Clearing old data...')
    await db.collection('places').deleteMany({})
    await db.collection('users').deleteMany({})
    await db.collection('reviews').deleteMany({})

    console.log('Seeding users...')
    const hashedPassword = await bcrypt.hash('password123', 10)
    const adminUser = {
      username: 'admin',
      email: 'admin@villupuram.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      contributions: { placesAdded: 0, reviewsWritten: 0, photosUploaded: 0 },
      createdAt: new Date()
    }
    const travelerUser = {
      username: 'traveler99',
      email: 'traveler@example.com',
      password: hashedPassword,
      role: 'user',
      isVerified: false,
      contributions: { placesAdded: 0, reviewsWritten: 0, photosUploaded: 0 },
      createdAt: new Date()
    }
    const adminResult = await db.collection('users').insertOne(adminUser)
    await db.collection('users').insertOne(travelerUser)

    console.log('Seeding places...')
    const places = [
      {
        name: 'Gingee Fort',
        category: 'Heritage',
        description: 'The Troy of the East, an impenetrable fortress built across three hillocks.',
        fullDescription: 'Gingee Fort or Senji Fort in Tamil Nadu, India is one of the surviving forts in Tamil Nadu. It was so fortified that Shivaji ranked it as the most impregnable fortress in India, and it was called the "Troy of the East" by the British.',
        images: ['https://images.unsplash.com/photo-1596484552993-9c8e2bd06a14?auto=format&fit=crop&w=1200&q=80'],
        location: { address: 'Gingee, Villupuram District, Tamil Nadu', latitude: 12.2483, longitude: 79.4187 },
        rating: 4.8,
        reviewCount: 124,
        status: 'Approved',
        createdBy: adminResult.insertedId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Kaliveli Lake',
        category: 'Nature',
        description: 'A major coastal wetland and bird sanctuary.',
        fullDescription: 'Kaliveli Lake is a coastal lake and wetland in the Viluppuram District. It is one of the largest wetlands in peninsular India and a sanctuary for migratory birds.',
        images: ['https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?auto=format&fit=crop&w=1200&q=80'],
        location: { address: 'Marakkanam, Villupuram', latitude: 12.1977, longitude: 79.8732 },
        rating: 4.5,
        reviewCount: 89,
        status: 'Approved',
        createdBy: adminResult.insertedId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Auroville',
        category: 'Heritage',
        description: 'An experimental township dedicated to human unity.',
        fullDescription: 'Auroville is an experimental township in Viluppuram district mostly in the state of Tamil Nadu, India with some parts in the Union Territory of Puducherry in India.',
        images: ['https://images.unsplash.com/photo-1565551980846-9d3dd81da363?auto=format&fit=crop&w=1200&q=80'],
        location: { address: 'Auroville, Villupuram', latitude: 12.0069, longitude: 79.8105 },
        rating: 4.9,
        reviewCount: 512,
        status: 'Approved',
        createdBy: adminResult.insertedId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    
    await db.collection('places').insertMany(places)

    console.log('Database seeded successfully!')
  } catch (err) {
    console.error('Error seeding DB:', err)
  } finally {
    await client.close()
  }
}

seed()
