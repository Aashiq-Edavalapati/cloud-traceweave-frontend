'use client';
import AuthBackground from '@/components/auth/AuthBackground';

export default function AuthLayout({ children }) {
  return (
    // 1. Outer Container: Fixed height, allows scrolling (overrides global overflow-hidden)
    <div className="relative h-screen w-full overflow-y-auto bg-bg-base">
      
      {/* 2. Background: Fixed position so it doesn't scroll with the content */}
      <div className="fixed inset-0 z-0">
        <AuthBackground />
      </div>
      
      {/* 3. Flex Container: Ensures vertical centering but allows expansion */}
      <div className="relative z-10 min-h-full flex flex-col items-center justify-center p-6 sm:p-12">
        
        {/* Top spacer to ensure centering balance, but collapses on small screens */}
        <div className="flex-1" />

        {/* The Main Content (Card) */}
        <main className="w-full max-w-md my-8">
          {children}
        </main>

        <div className="flex-1 flex items-end">
            <footer className="w-full text-center pb-6">
                <p className="text-xs text-text-secondary opacity-50">
                © 2026 TraceWeave Inc. All rights reserved.
                </p>
            </footer>
        </div>

      </div>
    </div>
  );
}