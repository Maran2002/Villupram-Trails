import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAuthUser, unauthorized, forbidden } from '@/lib/auth'

export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (user.role !== 'admin') return forbidden()

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const db = await getDb()

    // 1. Fetch recent logs for the table
    const logs = await db.collection('visitor_logs')
      .find({ timestamp: { $gte: startDate } })
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray()

    // 2. Aggregate visits per day for the chart
    const dailyVisits = await db.collection('visitor_logs').aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 },
          unique: { $addToSet: "$ip" }
        }
      },
      { $project: { date: "$_id", count: 1, unique: { $size: "$unique" }, _id: 0 } },
      { $sort: { date: 1 } }
    ]).toArray()

    // 3. Aggregate device distribution
    const deviceStats = await db.collection('visitor_logs').aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: "$device", value: { $sum: 1 } } },
      { $project: { name: "$_id", value: 1, _id: 0 } }
    ]).toArray()

    // 4. Aggregate top pages
    const pageStats = await db.collection('visitor_logs').aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: "$path", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { path: "$_id", count: 1, _id: 0 } }
    ]).toArray()

    // 5. Aggregate browser distribution
    const browserStats = await db.collection('visitor_logs').aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: "$browser", value: { $sum: 1 } } },
      { $project: { name: "$_id", value: 1, _id: 0 } }
    ]).toArray()

    return NextResponse.json({
      success: true,
      data: {
        logs,
        dailyVisits,
        deviceStats,
        pageStats,
        browserStats,
        summary: {
          totalVisits: logs.length, // this is just for the fetched set, real total might be higher
          uniqueVisitors: new Set(logs.map(l => l.ip)).size
        }
      }
    })
  } catch (error) {
    console.error('Error fetching admin logs:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
