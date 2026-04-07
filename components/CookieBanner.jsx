'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import InfoTooltip from '@/components/InfoTooltip';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if not yet accepted
    const accepted = localStorage.getItem('cookie_consent');
    if (!accepted) {
      // Slight delay so it doesn't flash on load
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
      style={{ backdropFilter: 'blur(4px)' }}
    >
      <div className="max-w-4xl mx-auto">
        <div
          className="bg-gray-900 border border-gray-700 rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ boxShadow: '0 -4px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.1)' }}
        >
          {/* Icon */}
          <div className="text-3xl flex-shrink-0">🍪</div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm mb-1 flex items-center gap-2">
              We use cookies{' '}
              <InfoTooltip
                position="top"
                size={13}
                text="Essential cookies: keep you logged in and save preferences. Analytics cookies: anonymous usage data to improve the app. No personal data is sold."
              />
            </p>
            <p className="text-gray-400 text-xs leading-relaxed">
              5S Arena uses essential cookies to keep you logged in and remember your preferences. We also use analytics cookies to improve your experience on the pitch.{' '}
              <Link href="/privacy" className="text-green-400 hover:text-green-300 underline">
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={decline}
              className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-all uppercase tracking-widest"
            >
              Decline
            </button>
            <button
              onClick={accept}
              className="px-5 py-2 text-xs font-black text-white rounded-xl transition-all hover:scale-105 uppercase tracking-widest"
              style={{
                background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
                boxShadow: '0 0 15px rgba(34,197,94,0.4)',
              }}
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
