'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith('/admin')) return;

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        event: 'pageview',
        meta: { referrer: document.referrer },
      }),
    }).catch(() => {}); // Silent fail
  }, [pathname]);

  // Track custom events — expose globally
  useEffect(() => {
    window.trackEvent = (event, meta = {}) => {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: window.location.pathname, event, meta }),
      }).catch(() => {});
    };
  }, []);

  return null;
}
