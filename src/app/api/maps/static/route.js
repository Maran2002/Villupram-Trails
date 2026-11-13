import { limitApiRequest } from '@/lib/rateLimit'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const limited = await limitApiRequest(request)
  if (limited) return limited
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return NextResponse.json({ success: false, error: 'Map previews are not configured' }, { status: 503 })

  const params = new URL(request.url).searchParams
  const rawLat = params.get('lat')
  const rawLng = params.get('lng')
  const lat = Number(rawLat)
  const lng = Number(rawLng)
  const zoom = Number(params.get('zoom') || 15)
  if (rawLat === null || rawLat === '' || rawLng === null || rawLng === '' || !Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180 || !Number.isInteger(zoom) || zoom < 1 || zoom > 20) {
    return NextResponse.json({ success: false, error: 'Invalid map coordinates' }, { status: 400 })
  }

  // Fixed image dimensions and rounded centers prevent arbitrary upstream URLs
  // and improve cache reuse for nearby coordinates.
  const centerLat = lat.toFixed(4)
  const centerLng = lng.toFixed(4)
  const upstreamUrl = new URL('https://maps.googleapis.com/maps/api/staticmap')
  upstreamUrl.search = new URLSearchParams({
    center: `${centerLat},${centerLng}`,
    zoom: String(zoom),
    size: '600x300',
    scale: '2',
    markers: `color:red|${centerLat},${centerLng}`,
    key,
  }).toString()

  try {
    const upstream = await fetch(upstreamUrl, { cache: 'force-cache', signal: AbortSignal.timeout(8000) })
    const contentType = upstream.headers.get('content-type') || ''
    if (!upstream.ok || !contentType.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Map preview is temporarily unavailable' }, { status: 502 })
    }
    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Map preview is temporarily unavailable' }, { status: 502 })
  }
}
