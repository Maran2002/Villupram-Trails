import { limitApiRequest } from '@/lib/rateLimit'
import { readJson, requestBodyError } from '@/lib/requestJson'
import { NextResponse } from 'next/server'
import { getAuthUser, unauthorized } from '@/lib/auth'

export async function POST(request) {
  const limited = await limitApiRequest(request)
  if (limited) return limited
  const user = await getAuthUser(request)
  if (!user) return unauthorized()

  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return NextResponse.json({ success: false, error: 'Address lookup is not configured' }, { status: 503 })

  try {
    const { lat, lng } = await readJson(request)
    const latitude = Number(lat)
    const longitude = Number(lng)
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      return NextResponse.json({ success: false, error: 'Enter valid latitude and longitude' }, { status: 400 })
    }

    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
    url.search = new URLSearchParams({ latlng: `${latitude},${longitude}`, key }).toString()
    const response = await fetch(url, { cache: 'force-cache', signal: AbortSignal.timeout(8000) })
    if (!response.ok) return NextResponse.json({ success: false, error: 'Address lookup is temporarily unavailable' }, { status: 502 })
    const data = await response.json()
    if (data.status !== 'OK' || !data.results?.[0]?.formatted_address) {
      return NextResponse.json({ success: false, error: 'No address found for these coordinates' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: { address: data.results[0].formatted_address } }, {
      headers: { 'Cache-Control': 'private, max-age=300' },
    })
  } catch (error) {
    const bodyError = requestBodyError(error)
    if (bodyError) return bodyError
    return NextResponse.json({ success: false, error: 'Address lookup is temporarily unavailable' }, { status: 502 })
  }
}
