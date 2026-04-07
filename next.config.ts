import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip type-checking & linting during CI build for speed (run these locally)
  typescript: { ignoreBuildErrors: true },
  // Prevent webpack from bundling native/binary packages
  serverExternalPackages: ["bcryptjs", "mongoose", "mongodb"],

  // Turbopack removed from config — production build uses stable webpack.
  // For local dev with Turbopack: run `next dev --turbopack`
  allowedDevOrigins: ["192.168.101.106", "*.local", "localhost"],

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "crests.football-data.org" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "www.thesportsdb.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "media.api-sports.io" },
      { protocol: "https", hostname: "media-1.api-sports.io" },
      { protocol: "https", hostname: "media-2.api-sports.io" },
      { protocol: "https", hostname: "media-3.api-sports.io" },
      { protocol: "https", hostname: "media-4.api-sports.io" },
    ],
  },

  async headers() {
    const isDev = process.env.NODE_ENV !== "production";
    const headersArr = [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://maps.googleapis.com https://plausible.io https://www.youtube.com https://s.ytimg.com`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://maps.googleapis.com https://*.google-analytics.com https://api.anthropic.com https://api.groq.com https://plausible.io",
              "frame-src 'self' https://www.youtube.com https://www.dailymotion.com https://player.vimeo.com https://www.fifa.com https://uefa.tv https://maps.google.com https://www.google.com https://maps.googleapis.com",
              "object-src 'none'",
              "base-uri 'self'",
            ].join("; "),
          },
        ],
      },
      // Note: Do NOT set custom Cache-Control headers here.
      // Next.js 16 + Turbopack owns all caching. Custom Cache-Control
      // headers cause the production build optimizer to hang indefinitely.
      // Vercel/Next.js automatically handles caching for static assets,
      // images, and service workers.
    ];
    return headersArr;
  },
};

export default nextConfig;
