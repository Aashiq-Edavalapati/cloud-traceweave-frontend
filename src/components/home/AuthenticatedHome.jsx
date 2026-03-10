'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { useModal } from '@/components/providers/ModalProvider';
import { ResizableSidebar } from './auth_landing/ResizableSidebar';
import { Sidebar } from './auth_landing/Sidebar';
import { DashboardHeader } from './auth_landing/DashboardHeader';
import { WelcomeSection } from './auth_landing/WelcomeSection';
import { StatsGrid } from './auth_landing/StatsGrid';
import { WorkspacesList } from './auth_landing/WorkspacesList';
import { QuickActions } from './auth_landing/QuickActions';
import { RecentActivity } from './auth_landing/RecentActivity';
import { CreateWorkspaceModal } from '@/components/home/auth_landing/CreateWorkspaceModal';
import { Zap, Loader2 } from 'lucide-react';

export default function AuthenticatedHome() {
  const { user, logout } = useAuthStore();
  
  // FIX 1: Brought in duplicateWorkspace and deleteWorkspace
  const { 
    availableWorkspaces, 
    fetchWorkspaces, 
    fetchGlobalHistory, 
    fetchGlobalStats,
    duplicateWorkspace,
    deleteWorkspace 
  } = useAppStore();

  // FIX 2: Added useModal hook for showAlert and showConfirm
  const { showConfirm, showAlert } = useModal();

  // FIX 3: Added the missing state variables
  const [editData, setEditData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
    fetchGlobalHistory();
    fetchGlobalStats();
  }, [fetchWorkspaces, fetchGlobalHistory, fetchGlobalStats]);

  const handleEditWorkspace = (ws) => {
    setEditData(ws);
    setIsEditModalOpen(true);
  };

  const handleDuplicateWorkspace = async (ws) => {
    setIsProcessing(true);
    try {
        const result = await duplicateWorkspace(ws.id);
        if (result.success) {
            showAlert(`"${ws.name}" has been cloned successfully. Only you have access to the new copy.`, "Success");
        } else {
            showAlert(result.error, "Duplicate Failed");
        }
    } catch (err) {
        showAlert("An unexpected error occurred during duplication.", "Error");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleDeleteWorkspace = (ws) => {
    showConfirm(
        `Are you sure you want to terminate "${ws.name}"? This action is permanent and all data (collections, workflows, and environments) within this workspace will be lost.`,
        async () => {
            const result = await deleteWorkspace(ws.id);
            if (!result.success) {
                showAlert(result.error, "Error");
            }
        },
        "Terminate Workspace"
    );
  };

  return (
    <div className="flex h-screen bg-bg-base text-text-primary overflow-hidden font-sans selection:bg-brand-primary/30">
      
      {/* FIX 4: Added the Global Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4"
            >
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                    <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-primary animate-pulse" size={24} />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-white tracking-tight">Cloning Workspace</h2>
                    <p className="text-text-muted text-sm mt-1">Deep-copying assets and creating independent records...</p>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Refined Sidebar Container */}
      <ResizableSidebar>
        {/* Sidebar Brand Header */}
        <div className="h-14 flex items-center px-5 border-b border-border-subtle shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="p-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20 group-hover:border-brand-primary/40 transition-all">
                <Zap size={18} className="text-brand-primary fill-brand-primary/20" />
            </div>
            <span className="font-black text-sm uppercase tracking-widest text-white/90 group-hover:text-white transition-colors">
                Trace-weave
            </span>
          </div>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <Sidebar />
        </div>
      </ResizableSidebar>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0F] relative">
        {/* Subtle Background Radial Glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(157,90,229,0.05)_0%,transparent_50%)] pointer-events-none" />
        
        <DashboardHeader user={user} logout={logout} />
        
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 relative z-10">
          <div className="max-w-7xl mx-auto space-y-10 pb-20">
            <WelcomeSection user={user} />
            
            <StatsGrid />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <WorkspacesList 
                  workspaces={availableWorkspaces} 
                  onEdit={handleEditWorkspace}
                  onDuplicate={handleDuplicateWorkspace}
                  onDelete={handleDeleteWorkspace}  
                />
              </div>
              <div className="lg:col-span-4 space-y-8">
                <QuickActions />
                <RecentActivity />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* FIX 5: Added the Edit Modal component to the DOM */}
      <CreateWorkspaceModal
          isOpen={isEditModalOpen}
          onClose={() => {
              setIsEditModalOpen(false);
              setEditData(null);
          }}
          editData={editData}
      />
    </div>
  );
}