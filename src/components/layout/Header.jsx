'use client';

import React, { useState, useEffect } from 'react';
import { Search, Layers, Eye, Briefcase, UserPlus, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import Dropdown from '../ui/Dropdown';
import InviteMembersModal from './InviteMembersModal';
import Link from 'next/link';

import { motion } from 'framer-motion';

export default function Header() {
  const store = useAppStore();
  const router = useRouter();
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Initial load check
  useEffect(() => {
    if ((!store.availableWorkspaces || store.availableWorkspaces?.length === 0) && !store.isLoadingWorkspaces) {
      store.fetchWorkspaces();
    }
    if (store.activeWorkspaceId && (!store.availableEnvironments || store.availableEnvironments?.length === 0)) {
      store.fetchEnvironments(store.activeWorkspaceId);
    }
  }, [store.activeWorkspaceId]);

  // --- Logic for Environment Dropdown ---
  const currentEnv = store.getWorkspaceEnvironments()[store.selectedEnvIndex];

  const envOptions = [
    {
      label: 'No Environment',
      value: -1,
      className: 'text-text-muted italic'
    },
    ...store.getWorkspaceEnvironments().map((e, idx) => ({
      label: e.name,
      value: idx,
      className: 'text-white'
    }))
  ];

  const selectedOption = envOptions.find(opt => opt.value === store.selectedEnvIndex) || envOptions[0];

  return (
    <>
      <header className="h-14 glass-strong border-b border-white/10 flex items-center px-6 justify-between shrink-0 z-40 select-none relative">
        <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />

        {/* Workspace Dropdown */}
        <div className="flex items-center gap-6 relative z-10">
          <div className="flex items-center gap-1">
            <Dropdown
              icon={Briefcase}
              value={store.availableWorkspaces.find(ws => ws.id === store.activeWorkspaceId)?.name}
              options={store.availableWorkspaces.map(ws => ws.name)}
              onSelect={(name) => {
                const ws = store.availableWorkspaces.find(w => w.name === name);
                if (ws) {
                  store.setActiveWorkspace(ws.id);
                  router.push(`/workspace/${ws.id}`);
                }
              }}
              onOpen={() => store.fetchWorkspaces()}
              label="Workspaces"
              className="font-bold text-white tracking-tight"
            />
          </div>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center justify-center w-8 h-8 hover:bg-white/5 rounded-lg text-text-muted hover:text-white transition-all group"
              title="Back to Home"
            >
              <Home size={16} className="group-hover:scale-110 transition-transform" />
            </Link>
            <button
              onClick={() => setIsInviteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-lg text-text-muted hover:text-brand-primary transition-all text-xs font-black uppercase tracking-widest"
            >
              <UserPlus size={14} />
              <span>Invite</span>
            </button>
          </div>
        </div>

        {/* Search - Enhanced */}
        <div className="flex-1 max-w-2xl mx-12 relative z-10">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={14} className="text-text-muted group-focus-within:text-brand-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search traces, collections, or requests..."
              className="w-full bg-white/5 text-sm text-white rounded-xl py-2 pl-10 pr-16 border border-white/5 focus:border-brand-primary/50 focus:bg-white/10 focus:outline-none transition-all placeholder:text-text-muted/50 font-medium"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-text-muted font-mono tracking-tighter">⌘</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-text-muted font-mono tracking-tighter">K</kbd>
            </div>
          </div>
        </div>

        {/* Actions & Environment */}
        <div className="flex items-center gap-4 relative z-10">
          <Dropdown
            icon={Layers}
            value={selectedOption.label}
            options={envOptions}
            onSelect={(option) => {
              if (typeof option === 'object') {
                store.setSelectedEnvIndex(option.value);
              } else {
                const found = envOptions.find(o => o.label === option);
                if (found) store.setSelectedEnvIndex(found.value);
              }
            }}
            onOpen={() => {
              if (store.activeWorkspaceId) store.fetchEnvironments(store.activeWorkspaceId)
            }}
            label="Environments"
            className="font-bold text-text-muted hover:text-white"
          />

          <div className="h-6 w-px bg-white/10 mx-1"></div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Eye size={18} className="text-text-muted hover:text-brand-primary cursor-pointer transition-colors" />
          </motion.div>

          <button className="bg-brand-primary hover:bg-brand-glow text-brand-surface text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full transition-all hover-glow shadow-glow-sm">
            Upgrade Plan
          </button>
        </div>
      </header>

      <InviteMembersModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </>
  );
}
