'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { ResizableSidebar } from './auth_landing/ResizableSidebar';
import { Sidebar } from './auth_landing/Sidebar';
import { DashboardHeader } from './auth_landing/DashboardHeader';
import { WelcomeSection } from './auth_landing/WelcomeSection';
import { StatsGrid } from './auth_landing/StatsGrid';
import { WorkspacesList } from './auth_landing/WorkspacesList';
import { QuickActions } from './auth_landing/QuickActions';
import { RecentActivity } from './auth_landing/RecentActivity';

export default function AuthenticatedHome() {
  const { user, logout } = useAuthStore();
  const { availableWorkspaces, fetchWorkspaces, fetchGlobalHistory, fetchGlobalStats } = useAppStore();

  useEffect(() => {
    fetchWorkspaces();
    fetchGlobalHistory();
    fetchGlobalStats();
  }, []);

  return (
    <div className="flex h-screen bg-bg-base text-text-primary overflow-hidden font-sans">
      <ResizableSidebar>
        <div className="h-14 flex items-center px-4 border-b border-border-subtle">
          <Image src="/logo.png" alt="Trace-weave Logo" width={35} height={35} />
          <span className="font-bold text-m tracking-tight ml-2">Trace-weave</span>
        </div>
        <Sidebar />
      </ResizableSidebar>

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader user={user} logout={logout} />
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            <WelcomeSection user={user} />
            <StatsGrid />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <WorkspacesList workspaces={availableWorkspaces} />
              <div className="space-y-6">
                <QuickActions />
                <RecentActivity />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}