'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Briefcase, Folder, FileCode, Layers, GitMerge, 
  Activity, ChevronDown, ChevronRight, X, User, Settings, 
  Building2, Home, History, Users, Globe 
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandPalette({ isOpen, onClose }) {
  const store = useAppStore();
  const router = useRouter();
  
  const [query, setQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const inputRef = useRef(null);
  const itemRefs = useRef({});

  // Reset state and focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setCollapsedSections({});
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selection and collapse states when user types
  useEffect(() => {
    setCollapsedSections({});
    setSelectedIndex(0);
  }, [query]);

  const toggleSection = (title) => {
    setCollapsedSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const handleNavigation = (targetWorkspaceId, path, tabId = null) => {
    if (targetWorkspaceId && targetWorkspaceId !== store.activeWorkspaceId) {
      store.setActiveWorkspace(targetWorkspaceId);
    }
    if (tabId) {
      store.openTab(tabId);
    }
    router.push(path);
    onClose();
  };

  const searchData = useMemo(() => {
    const lowerQuery = query.toLowerCase().trim();

    const wsMap = (store.availableWorkspaces || []).reduce((acc, ws) => {
      acc[ws.id] = ws.name;
      return acc;
    }, {});

    const colToWsMap = (store.collections || []).reduce((acc, c) => {
      acc[c.id] = { wsId: c.workspaceId, wsName: wsMap[c.workspaceId] || 'Unknown Workspace' };
      return acc;
    }, {});

    const pages = [
      { id: 'p-home', name: 'Dashboard Home', type: 'Navigation', icon: Home, action: () => { router.push('/'); onClose(); } },
      { id: 'p-workspace', name: 'Workspaces Overview', type: 'Navigation', icon: Briefcase, action: () => { router.push('/workspace'); onClose(); } },
      { id: 'p-envs', name: 'Global Environments', type: 'Navigation', icon: Globe, action: () => { router.push('/environments'); onClose(); } },
      { id: 'p-history', name: 'Global History', type: 'Navigation', icon: History, action: () => { router.push('/history'); onClose(); } },
      { id: 'p-team', name: 'Team & Members', type: 'Navigation', icon: Users, action: () => { router.push('/team'); onClose(); } },
      { id: 'p-profile', name: 'Your Profile', type: 'Navigation', icon: User, action: () => { router.push('/profile'); onClose(); } },
      { id: 'p-settings', name: 'Settings', type: 'Navigation', icon: Settings, action: () => { router.push('/settings'); onClose(); } },
      { id: 'p-billing', name: 'Billing & Plan', type: 'Navigation', icon: Building2, action: () => { router.push('/billing'); onClose(); } },
    ];

    const workspaces = (store.availableWorkspaces || []).map(w => ({
      id: `ws-${w.id}`, name: w.name, type: 'Workspace', icon: Briefcase,
      action: () => handleNavigation(w.id, `/workspace/${w.id}/collections`)
    }));

    const collections = (store.collections || []).map(c => ({
      id: `col-${c.id}`, name: c.name, type: `Collection • ${colToWsMap[c.id]?.wsName || 'Unknown'}`, icon: Folder,
      action: () => handleNavigation(c.workspaceId, `/workspace/${c.workspaceId}/collections`)
    }));

    const requests = Object.values(store.requestStates || {})
      .filter(r => !r.isDetached && r.collectionId) 
      .map(r => {
        const context = colToWsMap[r.collectionId] || { wsId: store.activeWorkspaceId, wsName: wsMap[store.activeWorkspaceId] || 'Active Workspace' };
        return {
          id: `req-${r.id}`, name: r.name, type: `Request (${r.protocol?.toUpperCase()}) • ${context.wsName}`, icon: FileCode,
          action: () => handleNavigation(context.wsId, `/workspace/${context.wsId}/collections`, r.id)
        };
      });

    const envs = [];
    Object.entries(store.workspaceEnvironments || {}).forEach(([wsId, wsEnvs]) => {
      (wsEnvs || []).forEach(e => {
        envs.push({
          id: `env-${e.id}`, name: e.name, type: `Environment • ${wsMap[wsId] || 'Unknown'}`, icon: Layers,
          action: () => handleNavigation(wsId, `/workspace/${wsId}/environments`, e.id)
        });
      });
    });

    const workflows = (store.workflows || []).map(w => ({
      id: `wf-${w.id}`, name: w.name, type: `Workflow • ${wsMap[w.workspaceId] || 'Unknown'}`, icon: GitMerge,
      action: () => handleNavigation(w.workspaceId, `/workspace/${w.workspaceId}/workflows/${w.id}`)
    }));

    const monitors = Object.values(store.monitorStates || {}).map(m => ({
      id: `mon-${m.id}`, name: m.name, type: 'Monitor', icon: Activity,
      action: () => handleNavigation(store.activeWorkspaceId, `/workspace/${store.activeWorkspaceId}/monitors`, m.id)
    }));

    const rawHistory = [...(store.history || []), ...(store.globalHistory || [])];
    const uniqueHistory = Array.from(new Map(rawHistory.map(item => [item.id || item._id, item])).values());
    const historyItems = uniqueHistory.map(h => ({
      id: `hist-${h.id || h._id}`, name: h.name || h.url || 'Unnamed Execution', type: `History • ${h.method || 'REQ'}`, icon: History,
      action: () => handleNavigation(h.workspaceId || store.activeWorkspaceId, `/workspace/${h.workspaceId || store.activeWorkspaceId}/collections`)
    }));

    const filterFn = (item) => {
      if (!lowerQuery) return true;
      return item.name.toLowerCase().includes(lowerQuery) || 
             item.type.toLowerCase().includes(lowerQuery);
    };

    return [
      { title: 'Navigation', items: lowerQuery ? pages.filter(filterFn) : [] }, 
      { title: 'Workspaces', items: workspaces.filter(filterFn) },
      { title: 'Requests', items: requests.filter(filterFn) },
      { title: 'Collections', items: collections.filter(filterFn) },
      { title: 'Environments', items: envs.filter(filterFn) },
      { title: 'Workflows', items: workflows.filter(filterFn) },
      { title: 'Monitors', items: monitors.filter(filterFn) },
      { title: 'History', items: historyItems.filter(filterFn) }
    ].filter(group => group.items.length > 0);
  }, [store, query, router]);

  // --- KEYBOARD NAVIGATION LOGIC ---
  
  // 1. Flatten visible items AND group headers so they can be navigated
  const visibleItems = useMemo(() => {
    let items = [];
    const isSearching = query.trim().length > 0;
    
    searchData.forEach(group => {
      const isCollapsed = isSearching 
        ? collapsedSections[group.title] === true 
        : collapsedSections[group.title] !== false;
      
      // Inject the header itself as a navigable item
      items.push({
        id: `header-${group.title}`,
        isHeader: true,
        title: group.title,
        action: () => toggleSection(group.title) // Pressing enter toggles it
      });

      // If not collapsed, inject the children
      if (!isCollapsed) {
        items.push(...group.items);
      }
    });
    return items;
  }, [searchData, collapsedSections, query]);

  useEffect(() => {
    if (visibleItems.length > 0 && selectedIndex >= visibleItems.length) {
      setSelectedIndex(visibleItems.length - 1);
    }
  }, [visibleItems, selectedIndex]);

  // Handle Input Keydown
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (visibleItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault(); 
      setSelectedIndex(prev => (prev < visibleItems.length - 1 ? prev + 1 : prev));
    } 
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } 
    else if (e.key === 'Enter') {
      e.preventDefault();
      const activeItem = visibleItems[selectedIndex];
      if (activeItem) {
        activeItem.action();
      }
    }
  };

  useEffect(() => {
    const activeItem = visibleItems[selectedIndex];
    if (activeItem && itemRefs.current[activeItem.id]) {
      itemRefs.current[activeItem.id].scrollIntoView({
        block: 'nearest'
      });
    }
  }, [selectedIndex, visibleItems]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh]">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-bg-panel border border-border-strong rounded-2xl shadow-2xl overflow-hidden flex flex-col mx-4"
        >
          {/* Header */}
          <div className="flex items-center px-4 py-3 border-b border-border-subtle bg-bg-base/50">
            <Search size={18} className="text-brand-primary" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search workspaces, requests, history, environments..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none text-white text-lg px-4 py-1 focus:outline-none placeholder:text-text-muted"
            />
            <button onClick={onClose} className="p-1 text-text-muted hover:text-white rounded-md hover:bg-white/10 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Results Area */}
          <div className="max-h-[55vh] overflow-y-auto custom-scrollbar p-2">
            {searchData.length === 0 ? (
              <div className="py-12 flex flex-col items-center text-text-muted">
                <Search size={32} className="mb-3 opacity-20" />
                <p>No results found for <span className="text-white font-medium">"{query}"</span></p>
              </div>
            ) : (
              searchData.map((group) => {
                const isSearching = query.trim().length > 0;
                const isCollapsed = isSearching 
                  ? collapsedSections[group.title] === true 
                  : collapsedSections[group.title] !== false;

                // Check if the header itself is selected
                const headerId = `header-${group.title}`;
                const isHeaderSelected = visibleItems[selectedIndex]?.id === headerId;

                return (
                  <div key={group.title} className="mb-2">
                    {/* Group Header (Now Navigable!) */}
                    <button 
                      ref={(el) => (itemRefs.current[headerId] = el)}
                      onClick={() => {
                        const idx = visibleItems.findIndex(v => v.id === headerId);
                        if(idx !== -1) setSelectedIndex(idx);
                        toggleSection(group.title);
                      }}
                      onMouseEnter={() => {
                        const idx = visibleItems.findIndex(v => v.id === headerId);
                        if(idx !== -1) setSelectedIndex(idx);
                      }}
                      className={`flex items-center gap-2 w-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-colors group ${
                        isHeaderSelected ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{group.title}</span>
                      <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded-full text-text-muted">
                        {group.items.length}
                      </span>
                      {isCollapsed ? (
                        <ChevronRight size={14} className="ml-auto opacity-50 group-hover:opacity-100" />
                      ) : (
                        <ChevronDown size={14} className="ml-auto opacity-50 group-hover:opacity-100" />
                      )}
                    </button>

                    {/* Group Items */}
                    {!isCollapsed && (
                      <div className="flex flex-col gap-0.5 mt-1">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isSelected = visibleItems[selectedIndex]?.id === item.id;
                          
                          return (
                            <button
                              key={item.id}
                              ref={(el) => (itemRefs.current[item.id] = el)} 
                              onClick={() => {
                                const idx = visibleItems.findIndex(v => v.id === item.id);
                                if(idx !== -1) setSelectedIndex(idx);
                                item.action();
                              }}
                              onMouseEnter={() => {
                                const idx = visibleItems.findIndex(v => v.id === item.id);
                                if(idx !== -1) setSelectedIndex(idx);
                              }}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left group ${
                                isSelected ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-white/5'
                              }`}
                            >
                              <div className={`p-1.5 rounded-md transition-colors ${
                                isSelected ? 'bg-brand-primary/20 text-brand-primary' : 'bg-bg-input text-text-muted group-hover:text-white'
                              }`}>
                                <Icon size={14} />
                              </div>
                              <div className="flex flex-col overflow-hidden">
                                <span className={`text-sm font-medium transition-colors truncate ${
                                  isSelected ? 'text-brand-primary' : 'text-text-primary group-hover:text-white'
                                }`}>
                                  {item.name}
                                </span>
                                <span className={`text-[10px] tracking-wide truncate ${
                                  isSelected ? 'text-brand-primary/70' : 'text-text-muted'
                                }`}>
                                  {item.type}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          
          {/* Footer Hints */}
          <div className="px-4 py-2 border-t border-border-subtle bg-bg-base flex justify-between items-center text-[10px] text-text-muted">
            <div className="flex items-center gap-2">
               <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono">↑</kbd><kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono">↓</kbd> Navigate</span>
               <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono">↵</kbd> Select</span>
            </div>
            <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono">esc</kbd> Close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}