'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminError({ error, reset }) {
  useEffect(() => {
    console.error('[Admin Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <p className="text-red-400 text-xs uppercase tracking-widest font-bold mb-3">Admin Error</p>
        <h2 className="text-2xl font-black text-white uppercase mb-4" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
          Something went wrong
        </h2>
        <p className="text-gray-400 text-sm mb-8">
          {error?.message || 'An unexpected error occurred in the admin panel.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all"
          >
            Try Again
          </button>
          <Link
            href="/admin/dashboard"
            className="px-6 py-3 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-bold uppercase text-xs tracking-widest rounded-xl transition-all"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
