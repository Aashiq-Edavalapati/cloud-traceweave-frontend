'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Layers, Eye, Check, Briefcase, UserPlus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import InviteMembersModal from './InviteMembersModal';

const Dropdown = ({ icon: Icon, value, options, onSelect, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-bg-input hover:bg-border-subtle rounded cursor-pointer border border-transparent hover:border-border-subtle transition"
      >
        {Icon && <Icon size={14} className="text-text-secondary" />}
        <span className="text-text-primary text-xs font-semibold max-w-[100px] truncate">{value}</span>
        <ChevronDown size={12} className="text-text-secondary" />
      </div>
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-bg-panel border border-border-strong rounded shadow-xl py-1 z-[100]">
          <div className="px-3 py-2 text-[10px] font-bold text-text-secondary uppercase tracking-wider">{label}</div>
          {options.map(opt => (
            <div 
              key={opt}
              onClick={() => { onSelect(opt); setIsOpen(false); }}
              className="px-3 py-2 text-sm hover:bg-brand-blue hover:text-white cursor-pointer flex items-center justify-between group"
            >
              <span>{opt}</span>
              {value === opt && <Check size={14} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Header() {
  const store = useAppStore();
  const [isInviteOpen, setIsInviteOpen] = useState(false); // Modal State

  return (
    <>
      <header className="h-12 bg-bg-base border-b border-border-subtle flex items-center px-4 justify-between shrink-0 z-50 select-none relative">
        
        {/* Workspace Dropdown */}
        <div className="flex items-center gap-4">
           <Dropdown 
              icon={Briefcase}
              value={store.availableWorkspaces.find(ws => ws.id === store.activeWorkspaceId)?.name} 
              options={store.availableWorkspaces.map(ws => ws.name)} 
              onSelect={(name) => {
                const ws = store.availableWorkspaces.find(w => w.name === name);
                if(ws) store.setActiveWorkspace(ws.id);
              }} 
              label="Workspaces"
           />
           {/* INVITE BUTTON */}
           <button 
              onClick={() => setIsInviteOpen(true)}
              className="flex items-center gap-1.5 px-2 py-1 hover:bg-bg-input rounded text-text-secondary hover:text-text-primary transition-colors text-xs font-medium"
           >
              <UserPlus size={14} />
              <span>Invite</span>
           </button>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-4">
           <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-text-secondary" />
              </div>
              <input 
                type="text" placeholder="Search TraceWeave" 
                className="w-full bg-bg-input text-sm text-text-primary rounded py-1.5 pl-9 pr-16 border border-transparent focus:border-border-strong focus:outline-none transition-all placeholder:text-text-muted"
              />
           </div>
        </div>

        {/* Actions & Environment */}
        <div className="flex items-center gap-3">
           <Dropdown 
              icon={Layers}
              value={store.getWorkspaceEnvironments()[store.selectedEnvIndex]?.name || 'No Env'}
              options={store.getWorkspaceEnvironments().map(e => e.name)}
              onSelect={(name) => {
                 const idx = store.getWorkspaceEnvironments().findIndex(e => e.name === name);
                 if (idx !== -1) store.setSelectedEnvIndex(idx);
              }}
              label="Environment"
           />
           <div className="h-4 w-[1px] bg-border-subtle mx-1"></div>
           <Eye size={18} className="text-text-secondary hover:text-text-primary cursor-pointer" />
           <button className="bg-brand-orange hover:bg-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded transition">Upgrade</button>
        </div>
      </header>

      {/* Invite Modal */}
      <InviteMembersModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </>
  );
}