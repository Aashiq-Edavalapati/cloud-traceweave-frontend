'use client';

import React from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { useEffect } from 'react';
import { ResizableSidebar } from './auth_landing/ResizableSidebar';
import { Sidebar } from './auth_landing/Sidebar';
import { DashboardHeader } from './auth_landing/DashboardHeader';
import { WelcomeSection } from './auth_landing/WelcomeSection';
import { StatsGrid } from './auth_landing/StatsGrid';
import { WorkspacesList } from './auth_landing/WorkspacesList';
import { QuickActions } from './auth_landing/QuickActions';
import { RecentActivity } from './auth_landing/RecentActivity';

/* --- MAIN DASHBOARD CONTENT --- */
export default function AuthenticatedHome() {
  const { user, logout } = useAuthStore();
  const { availableWorkspaces, fetchWorkspaces } = useAppStore();

  useEffect(() => {
    fetchWorkspaces();
  }, []); // Run on mount

  const isLoading = availableWorkspaces.length === 0 && !user; // Simple heuristic or use store loading state if available

  const workspaces = availableWorkspaces.map(ws => ({
    id: ws.id,
    name: ws.name,
    status: ws.status || 'healthy',
    metrics: ws.metrics || { req: '0', err: '0%', lat: '0ms' },
    updated: ws.updatedAt ? new Date(ws.updatedAt).toLocaleDateString() : 'Just now'
  }));

  return (
    <div className="flex h-screen bg-bg-base text-text-primary overflow-hidden font-sans">

      {/* 1. SIDEBAR */}
      <ResizableSidebar>
        <div className="h-14 flex items-center px-4 border-b border-border-subtle">
          <Image src="/logo.png" alt="Trace-weave Logo" width={35} height={35} />
          <span className="font-bold text-m tracking-tight">Trace-weave</span>
        </div>
        <Sidebar />
      </ResizableSidebar>

      {/* 2. MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <DashboardHeader user={user} logout={logout} />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="max-w-6xl mx-auto space-y-8">

            {/* Greeting & Stats */}
            <WelcomeSection user={user} />

            {/* Quick Stats Grid */}
            <StatsGrid />

            {/* Main Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left Column: Workspaces (2/3) */}
              <WorkspacesList workspaces={workspaces} />

              {/* Right Column: Quick Actions & Links (1/3) */}
              <div className="space-y-6">

                {/* Quick Actions */}
                <QuickActions />

                {/* Recent Activity Mini-List */}
                <RecentActivity />

              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}