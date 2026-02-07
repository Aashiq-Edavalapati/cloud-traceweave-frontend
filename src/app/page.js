'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import PublicLanding from '@/components/home/PublicLanding';
import AuthenticatedHome from '@/components/home/AuthenticatedHome';

export default function RootPage() {
  const { isAuthenticated, isChecking, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  // 1. Loading State (Prevent Flash)
  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-base text-text-secondary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // 2. The Switch
  if (isAuthenticated) {
    return <AuthenticatedHome />;
  }

  return <PublicLanding />;
}