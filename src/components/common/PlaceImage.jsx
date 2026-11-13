'use client'

import Image from 'next/image'

export function PlaceImage({ src, alt = '', fill = false, sizes, priority = false, unoptimized, ...props }) {
  const source = src || '/images/places/placeholder.jpg'
  const canOptimize = typeof source !== 'string' ||
    (/^\/(?!\/|api\/)/.test(source) && !source.includes('?')) ||
    source.startsWith('https://images.unsplash.com/')

  return (
    <Image
      src={source}
      alt={alt}
      fill={fill}
      sizes={sizes}
      preload={priority}
      unoptimized={unoptimized ?? !canOptimize}
      {...props}
    />
  )
}
