'use client';

// ClientOnly: renders nothing server-side, hydrates cleanly on client.
// Analytics tracking is handled by AnalyticsTracker in layout.jsx.
export default function ClientOnly() {
  return null;
}
