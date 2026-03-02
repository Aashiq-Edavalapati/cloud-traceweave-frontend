'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { PacmanLoader } from 'react-spinners';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { user, isChecking, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isChecking && !user) {
      console.log('User not authenticated, redirecting');
      router.push('/login');
    }
  }, [isChecking, user, router]);

  if (isChecking) {
    return (
        <div className="flex items-center justify-center h-screen bg-bg-base text-brand-primary">
            <PacmanLoader color="#EAC2FF" size={24} />
        </div>);
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-bg-base overflow-x-hidden w-full flex flex-col">
        {/* Immersive Background Glows - Innovative Ambient UI */}
        <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-brand-primary/10 blur-[180px] rounded-full pointer-events-none z-0" />
        <div className="fixed bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-brand-glow/10 blur-[180px] rounded-full pointer-events-none z-0" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vh] h-[120vh] bg-brand-surface/5 blur-[200px] rounded-full pointer-events-none z-0" />
        
        <div className="relative z-10 flex-1 flex flex-col w-full h-full min-h-screen">
            {children}
        </div>
    </div>
  );
}
