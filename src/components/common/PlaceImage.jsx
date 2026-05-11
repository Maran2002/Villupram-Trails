'use client'

import { isDataUri } from '@/lib/imageUtils'
import NextImage from 'next/image'

/**
 * PlaceImage — renders a base64 OR remote image correctly.
 * - Next.js <Image> does NOT support data: URIs, so we fall back to <img>.
 * - For remote URLs we keep the optimised Next.js Image pipeline.
 */
export function PlaceImage({ src, alt = '', fill = false, className = '', sizes, priority = false, ...rest }) {
  const fallback = '/images/places/placeholder.jpg'
  const source   = src || fallback

  if (isDataUri(source)) {
    // Base64 stored image — use plain <img>
    if (fill) {
      return (
        <img
          src={source}
          alt={alt}
          className={`absolute inset-0 w-full h-full ${className}`}
          style={{ objectFit: 'cover' }}
          loading={priority ? 'eager' : 'lazy'}
          {...rest}
        />
      )
    }
    return (
      <img
        src={source}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        {...rest}
      />
    )
  }

  // Remote URL — Next.js optimised pipeline
  return (
    <NextImage
      src={source}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      {...rest}
    />
  )
}
