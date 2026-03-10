'use client';

import React, { useState, useEffect } from 'react';
import { Search, Layers, Eye, Briefcase, UserPlus, Home, Plus, Monitor, DownloadCloud } from 'lucide-react'; // Added Monitor & DownloadCloud
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import Dropdown from '../ui/Dropdown';
import { CreateWorkspaceModal } from '@/components/home/auth_landing/CreateWorkspaceModal';
import InviteMembersModal from './InviteMembersModal';
import CommandPalette from '../ui/CommandPalette'; 
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Header() {
  const store = useAppStore();
  const router = useRouter();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // ... (Keep existing useEffects for Workspaces and Shortcuts)

  const currentEnv = store.getWorkspaceEnvironments()[store.selectedEnvIndex];
  const envOptions = [
    { label: 'No Environment', value: -1, className: 'text-text-muted italic' },
    ...store.getWorkspaceEnvironments().map((e, idx) => ({
      label: e.name, value: idx, className: 'text-white'
    }))
  ];
  const selectedOption = envOptions.find(opt => opt.value === store.selectedEnvIndex) || envOptions[0];

  return (
    <>
      <header className="h-14 glass-strong border-b border-white/10 flex items-center px-6 justify-between shrink-0 z-40 select-none relative">
        <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />

        {/* Workspace Dropdown Section */}
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
                  const currentTab = store.activeSidebarItem?.toLowerCase() || 'collections';
                  router.push(`/workspace/${ws.id}/${currentTab}`);
                }
              }}
              onOpen={() => store.fetchWorkspaces()}
              label="Workspaces"
              className="font-bold text-white tracking-tight"
              enableSearch={true}
              searchPlaceholder="Find workspace..."
              menuWidth="w-64"
              customFooter={
                <button
                  onClick={() => setIsCreateWorkspaceOpen(true)}
                  className="flex w-full items-center gap-2 px-2 py-1.5 rounded text-sm font-semibold text-brand-primary hover:bg-brand-primary/10 transition-colors"
                >
                  <Plus size={14} />
                  <span>New Workspace</span>
                </button>
              }
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

        {/* Search Trigger */}
        <div className="flex-1 max-w-2xl mx-12 relative z-10">
          <div 
            className="relative group cursor-pointer"
            onClick={() => setIsCommandPaletteOpen(true)}
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={14} className="text-text-muted group-focus-within:text-brand-primary transition-colors" />
            </div>
            <input
              type="text"
              readOnly
              placeholder="Search traces, collections, or requests..."
              className="w-full bg-white/5 text-sm text-white rounded-xl py-2 pl-10 pr-16 border border-white/5 hover:border-brand-primary/50 hover:bg-white/10 focus:outline-none transition-all placeholder:text-text-muted/50 font-medium cursor-pointer"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-text-muted font-mono tracking-tighter">⌘</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-text-muted font-mono tracking-tighter">K</kbd>
            </div>
          </div>
        </div>

        {/* Desktop App & Environment Actions */}
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
            className="font-bold text-text-muted hover:text-white hidden lg:flex"
          />

          <div className="h-6 w-px bg-white/10 mx-1 hidden lg:block"></div>

          {/* INNOVATIVE DESKTOP DOWNLOAD BUTTON */}
          <Link href="/download">
            <motion.div 
              whileHover={{ y: -1 }} 
              whileTap={{ scale: 0.98 }}
              className="relative group flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-brand-primary/40 px-3 py-1.5 rounded-full transition-all duration-300"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary/10 group-hover:bg-brand-primary/20 transition-colors">
                <Monitor size={12} className="text-brand-primary group-hover:scale-110 transition-transform" />
              </div>
              
              <div className="flex flex-col items-start leading-none pr-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-white">Desktop App</span>
                <span className="text-[8px] text-text-muted font-medium group-hover:text-brand-primary transition-colors">Native Performance</span>
              </div>

              <div className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
              </div>
            </motion.div>
          </Link>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Eye size={18} className="text-text-muted hover:text-brand-primary cursor-pointer transition-colors" />
          </motion.div>
        </div>
      </header>

      {/* Modals */}
      <InviteMembersModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
        onSuccess={(newWs) => {
          if (newWs?.id) {
            store.setActiveWorkspace(newWs.id);
            router.push(`/workspace/${newWs.id}/collections`);
            store.fetchWorkspaces();
          }
        }}
      />
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
    </>
  );
}