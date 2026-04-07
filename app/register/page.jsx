'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Register now redirects to the unified login/register page
export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?mode=register');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-green-400 animate-pulse text-lg">Redirecting...</div>
    </div>
  );
}
