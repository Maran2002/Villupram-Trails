/**
 * Utility for Google Maps API interactions.
 * Uses NEXT_PUBLIC_GOOGLE_MAPS_KEY from environment.
 */

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

/**
 * Generates a Google Maps external search URL
 */
export function getExternalMapUrl(placeName, location = {}) {
  const { lat, lng, address } = location
  if (lat && lng) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  }
  const query = encodeURIComponent(`${placeName} ${address || ''}`.trim())
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

/**
 * Generates an Embed API URL for an iframe
 */
export function getEmbedMapUrl(location = {}) {
  const { lat, lng, address } = location
  const query = lat && lng ? `${lat},${lng}` : encodeURIComponent(address || 'Villupuram, Tamil Nadu')
  return `https://www.google.com/maps/embed/v1/place?key=${API_KEY || ''}&q=${query}&zoom=14`
}

/**
 * Generates a Static Map image URL
 */
export function getStaticMapUrl(lat, lng, zoom = 15, size = '600x300') {
  if (!lat || !lng || !API_KEY) return null
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&markers=color:red%7C${lat},${lng}&key=${API_KEY}`
}

/**
 * Performs reverse geocoding to get address from coordinates
 * (Requires Geocoding API enabled on the key)
 */
export async function reverseGeocode(lat, lng) {
  if (!API_KEY) throw new Error('Google Maps API key missing')
  
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`)
    const data = await res.json()
    if (data.status === 'OK') {
      return data.results[0].formatted_address
    }
    throw new Error(data.error_message || data.status)
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}
