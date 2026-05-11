/**
 * src/lib/imageUtils.js
 * Client-side image compression + base64 conversion.
 * Keeps images within MongoDB's document size budget.
 */

const MAX_WIDTH  = 1200   // px
const MAX_HEIGHT = 900    // px
const QUALITY    = 0.78   // JPEG quality (0-1)
const MAX_BYTES  = 400_000 // ~400 KB per image after encoding

/**
 * Compress and convert a File to a base64 data URI.
 * Returns { dataUrl, sizeKB, width, height } or throws on error.
 */
export function compressToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.onload = (e) => {
      const img = new window.Image()
      img.onerror = () => reject(new Error('Invalid image file'))
      img.onload = () => {
        // Calculate scaled dimensions preserving aspect ratio
        let { width, height } = img
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height, 1)
        width  = Math.round(width  * ratio)
        height = Math.round(height * ratio)

        const canvas = document.createElement('canvas')
        canvas.width  = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Try JPEG first; if still too big, lower quality progressively
        let quality = QUALITY
        let dataUrl
        do {
          dataUrl = canvas.toDataURL('image/jpeg', quality)
          quality -= 0.08
        } while (dataUrl.length > MAX_BYTES * 1.37 && quality > 0.3)
        // 1.37 = base64 overhead factor (4/3 bytes per byte * some headroom)

        const sizeKB = Math.round((dataUrl.length * 0.75) / 1024)
        resolve({ dataUrl, sizeKB, width, height })
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

/** Returns true if the string is a base64 data URI */
export function isDataUri(src) {
  return typeof src === 'string' && src.startsWith('data:')
}

/** Returns true if the string is a usable image source (URL or data URI) */
export function isValidImageSrc(src) {
  return typeof src === 'string' && (src.startsWith('http') || src.startsWith('data:') || src.startsWith('/'))
}
