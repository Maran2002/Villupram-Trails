const MAX_FILE_BYTES = 25 * 1024 * 1024
const MAX_DATA_URL_LENGTH = 320_000

export async function compressToBase64(file, {
  maxWidth = 1200, maxHeight = 900, quality = 0.78,
} = {}) {
  if (!file || file.size > MAX_FILE_BYTES) throw new Error('Choose an image under 25 MB')

  const url = URL.createObjectURL(file)
  try {
    const image = new window.Image()
    image.src = url
    await image.decode()

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    let scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight, 1)
    for (let attempt = 0; attempt < 8; attempt++) {
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
      context.drawImage(image, 0, 0, canvas.width, canvas.height)

      const dataUrl = canvas.toDataURL('image/webp', quality)
      if (dataUrl.startsWith('data:image/') && dataUrl.length <= MAX_DATA_URL_LENGTH) {
        return {
          dataUrl,
          sizeKB: Math.ceil(dataUrl.length / 1024),
          width: canvas.width,
          height: canvas.height,
        }
      }
      scale *= 0.8
      quality = Math.max(0.5, quality - 0.06)
    }
    throw new Error('Could not compress this image. Try a smaller file.')
  } finally {
    URL.revokeObjectURL(url)
  }
}
