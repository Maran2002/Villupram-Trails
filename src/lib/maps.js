/** Build links and same-origin map image URLs without exposing the Google key. */
function mapDestination(placeName, location = {}) {
  const { lat, lng, address } = location
  if (lat != null && lng != null && lat !== '' && lng !== '' && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
    return encodeURIComponent(`${lat},${lng}`)
  }
  return encodeURIComponent(`${placeName || ''} ${address || ''}`.trim())
}

export function getExternalMapUrl(placeName, location) {
  return `https://www.google.com/maps/search/?api=1&query=${mapDestination(placeName, location)}`
}

export function getDirectionsUrl(placeName, location) {
  return `https://www.google.com/maps/dir/?api=1&destination=${mapDestination(placeName, location)}`
}

export function getStaticMapUrl(lat, lng, zoom = 15) {
  if (lat == null || lng == null || lat === '' || lng === '') return null
  const latitude = Number(lat)
  const longitude = Number(lng)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null
  }
  const params = new URLSearchParams({ lat: String(latitude), lng: String(longitude), zoom: String(zoom) })
  return `/api/maps/static?${params.toString()}`
}

/** Reverse geocoding is proxied through our authenticated server route. */
export async function reverseGeocode(lat, lng) {
  const response = await fetch('/api/maps/reverse-geocode', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ lat, lng }),
  })
  const result = await response.json()
  if (!response.ok || !result.success) throw new Error(result.error || 'Address lookup failed')
  return result.data.address
}
