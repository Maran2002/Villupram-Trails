import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAuthUser, unauthorized, forbidden } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'

export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (!hasPermission(user, 'logs', 'view')) return forbidden()

    const { searchParams } = new URL(request.url)
    const requestedDays = Number.parseInt(searchParams.get('days') || '7', 10)
    const days = Number.isFinite(requestedDays) ? Math.min(365, Math.max(1, requestedDays)) : 7
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const db = await getDb()

    const visitorLogs = db.collection('visitor_logs')
    const timeQuery = { timestamp: { $gte: startDate } }
    const [logs, totalPageViews] = await Promise.all([
      visitorLogs.find(timeQuery, { projection: { path: 1, referer: 1, device: 1, browser: 1, os: 1, timestamp: 1 } })
        .sort({ timestamp: -1 })
        .limit(100)
        .toArray(),
      visitorLogs.countDocuments(timeQuery),
    ])

    // Aggregate page views per day; the application does not retain a stable visitor identifier.
    const dailyVisits = await visitorLogs.aggregate([
      { $match: timeQuery },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 },
        }
      },
      { $project: { date: "$_id", count: 1, _id: 0 } },
      { $sort: { date: 1 } }
    ]).toArray()

    // 3. Aggregate device distribution
    const deviceStats = await visitorLogs.aggregate([
      { $match: timeQuery },
      { $group: { _id: "$device", value: { $sum: 1 } } },
      { $project: { name: "$_id", value: 1, _id: 0 } }
    ]).toArray()

    // 4. Aggregate top pages
    const pageStats = await visitorLogs.aggregate([
      { $match: timeQuery },
      { $group: { _id: "$path", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { path: "$_id", count: 1, _id: 0 } }
    ]).toArray()

    // 5. Aggregate browser distribution
    const browserStats = await visitorLogs.aggregate([
      { $match: timeQuery },
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
          totalPageViews,
          recentRecordsDisplayed: logs.length,
          days,
        }
      }
    })
  } catch (error) {
    console.error('Error fetching admin logs:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
