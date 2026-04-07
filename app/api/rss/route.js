export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXTAUTH_URL || 'https://fivesarena.com';

export async function GET() {
  const items = [
    {
      title: '5s Arena World Cup Tournament — Registrations Open',
      description: 'Sign up your team for the inaugural 5s Arena World Cup. 8 groups, 6 teams each. May 26–31, 2026 at Hellenic Football Club, Milnerton.',
      link: `${SITE_URL}/tournament`,
      pubDate: new Date('2026-01-01').toUTCString(),
    },
    {
      title: 'Book a 5-a-Side Court in Milnerton, Cape Town',
      description: 'Book floodlit FIFA-standard synthetic turf courts from R400/hour. Online booking with instant confirmation.',
      link: `${SITE_URL}/#courts`,
      pubDate: new Date('2025-12-01').toUTCString(),
    },
    {
      title: 'Events at 5s Arena — Birthdays, Corporate & Tournaments',
      description: 'Host your next event at 5s Arena. Kids birthday parties, premium corporate team building, and social tournaments.',
      link: `${SITE_URL}/events-and-services`,
      pubDate: new Date('2025-11-01').toUTCString(),
    },
  ];

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>5s Arena — Bookit 5s Arena News</title>
    <link>${SITE_URL}</link>
    <description>Latest news and updates from Bookit 5s Arena, Milnerton, Cape Town.</description>
    <language>en-za</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items
      .map(
        (item) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.description}]]></description>
      <link>${item.link}</link>
      <pubDate>${item.pubDate}</pubDate>
    </item>`
      )
      .join('')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
