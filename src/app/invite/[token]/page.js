'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { Network, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { PacmanLoader } from 'react-spinners';

export default function InviteAcceptPage() {
  const { token } = useParams();
  const router = useRouter();
  
  const { isAuthenticated, isChecking, checkAuth } = useAuthStore();
  const { acceptWorkspaceInvite } = useAppStore();

  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const [acceptedWorkspaceId, setAcceptedWorkspaceId] = useState(null);

  // Check Auth on Mount
  useEffect(() => {
    checkAuth();
  }, []);

  const handleAccept = async () => {
    setStatus('loading');
    const res = await acceptWorkspaceInvite(token);
    
    if (res.success) {
      setAcceptedWorkspaceId(res.workspaceId);
      setStatus('success');
      // Redirect to the workspace after a short delay so they see the success message
      setTimeout(() => {
        router.push(`/workspace/${res.workspaceId}`);
      }, 2000);
    } else {
      setErrorMessage(res.error);
      setStatus('error');
    }
  };

  // 1. Loading Auth State
  if (isChecking) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center">
        <PacmanLoader color="#EAC2FF" size={20} />
      </div>
    );
  }

  // 2. Not Authenticated State
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-bg-panel border border-border-subtle rounded-xl p-8 max-w-md w-full shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-brand-orange/10 flex items-center justify-center mx-auto mb-4">
            <Network size={24} className="text-brand-orange" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Workspace Invitation</h1>
          <p className="text-text-secondary text-sm mb-6">
            You've been invited to join a Trace-weave workspace. Please log in or create an account to accept the invitation.
          </p>
          <button 
            onClick={() => router.push(`/?returnUrl=/invite/${token}`)}
            className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Log in to continue
          </button>
        </div>
      </div>
    );
  }

  // 3. Authenticated - Action States
  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-4">
      <div className="bg-bg-panel border border-border-strong rounded-2xl p-8 max-w-md w-full shadow-[0_8px_30px_rgba(0,0,0,0.5)] text-center relative overflow-hidden">
        
        {/* Decorative Background Blob */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none"></div>

        {status === 'idle' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-orange to-brand-blue flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Network size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">You're Invited!</h1>
            <p className="text-text-secondary text-sm mb-8">
              Click below to accept the invitation and join the workspace team. Make sure you are logged in with the email address the invite was sent to.
            </p>
            <button 
              onClick={handleAccept}
              className="w-full flex items-center justify-center gap-2 bg-brand-orange hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors shadow-[0_0_15px_rgba(255,108,55,0.3)]"
            >
              Accept Invitation <ArrowRight size={18} />
            </button>
          </>
        )}

        {status === 'loading' && (
          <div className="flex flex-col items-center py-8">
            <PacmanLoader color="#EAC2FF" size={20} />
            <p className="text-sm font-mono mt-8 text-text-secondary animate-pulse">Verifying token...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-emerald-500 mb-2">Accepted!</h1>
            <p className="text-text-secondary text-sm">You have successfully joined the workspace. Redirecting you now...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="py-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-red-500 mb-2">Invitation Failed</h1>
            <p className="text-text-secondary text-sm mb-8">{errorMessage}</p>
            <button 
              onClick={() => router.push('/workspace')}
              className="px-6 py-2 bg-bg-input hover:bg-white/5 border border-border-subtle rounded-lg text-sm font-bold transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}