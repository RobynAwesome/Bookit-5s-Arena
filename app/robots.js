export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/profile', '/bookings'] },
    ],
    sitemap: `${process.env.NEXTAUTH_URL || 'https://fivesarena.com'}/sitemap.xml`,
  };
}
