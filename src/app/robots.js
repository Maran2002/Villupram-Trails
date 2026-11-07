export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  let sitemapUrl
  try {
    if (siteUrl) sitemapUrl = new URL('/sitemap.xml', siteUrl).toString()
  } catch {
    sitemapUrl = undefined
  }

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/dashboard/', '/contribute/', '/auth/'] },
    ],
    ...(sitemapUrl ? { sitemap: sitemapUrl } : {}),
  }
}
