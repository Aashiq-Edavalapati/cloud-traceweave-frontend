'use client';
import { useState, useRef, useEffect } from 'react';
import { Plus, X, Globe, Activity, ChevronsRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import UnsavedChangesModal from '@/components/ui/UnsavedChangesModal';

// Sub-panels
import EnvironmentTab from './EnvironmentTab';
import DashboardPanel from '../dashboard/DashboardPanel';
import HttpRequestPanel from './request_panel/HttpRequestPanel';
import GraphqlRequestPanel from './request_panel/GraphqlRequestPanel';
import GrpcRequestPanel from './request_panel/GrpcRequestPanel';
import WebSocketRequestPanel from './request_panel/WebSocketRequestPanel';

export default function RequestPanel() {
  const store = useAppStore();
  const activeId = store.activeTabId;

  // --- MODAL STATE ---
  const [closeCandidateId, setCloseCandidateId] = useState(null);

  // --- OVERFLOW TAB STATE ---
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1000); // Default safe width
  const [showDropdown, setShowDropdown] = useState(false);

  // 1. ✨ THE FIX: Accurately measure the parent container's width
  useEffect(() => {
    if (!containerRef.current) return;

    // Set initial width immediately
    setContainerWidth(containerRef.current.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- HANDLERS ---
  const handleTabClose = (e, tabId) => {
    e.stopPropagation();
    if (store.unsavedRequests.has(tabId)) {
      setCloseCandidateId(tabId);
    } else {
      store.closeTab(tabId);
    }
  };

  const handleDiscard = () => {
    if (closeCandidateId) {
      store.closeTab(closeCandidateId);
      setCloseCandidateId(null);
    }
  };

  const handleSaveAndClose = () => {
    if (!closeCandidateId) return;
    const isRequest = store.requestStates[closeCandidateId];
    const isEnv = store.getEnvironmentById(closeCandidateId);

    if (isRequest) store.saveRequest(closeCandidateId);
    else if (isEnv) store.saveEnvironment(closeCandidateId);

    store.closeTab(closeCandidateId);
    setCloseCandidateId(null);
  };

  const getCandidateName = () => {
    if (!closeCandidateId) return 'this item';
    const req = store.requestStates[closeCandidateId];
    if (req) return req.name || 'Untitled Request';
    const env = store.getEnvironmentById(closeCandidateId);
    if (env) return env.name;
    return 'this item';
  };

  // --- TAB DATA HELPER ---
  const getTabInfo = (tabId) => {
    const req = store.requestStates[tabId];
    const env = store.getEnvironmentById(tabId);
    const monitor = store.monitorStates[tabId];

    const methodColors = {
      GET: 'text-method-get',
      POST: 'text-method-post',
      PUT: 'text-method-put',
      DELETE: 'text-method-delete',
      PATCH: 'text-method-patch'
    };

    let name = 'Unknown';
    let icon = <Globe size={10} />;

    if (req) {
      name = req.name;
      icon = (
        <span className={`font-bold text-[10px] ${
          methodColors[req.config.method] || 'text-brand-primary'
        }`}>
          {req.config.method}
        </span>
      );
    } else if (env) {
      name = env.name;
      icon = <Globe size={10} className="text-brand-primary" />;
    } else if (monitor) {
      name = monitor.name;
      icon = <Activity size={10} className="text-brand-primary" />;
    }

    return {
      name,
      icon,
      isPreview: store.previewTabId === tabId,
      isDirty: store.unsavedRequests.has(tabId),
      isActive: tabId === activeId
    };
  };

  // --- Mathematical calculation for visible tabs ---
  const TAB_WIDTH = 176; // w-44 = 176px. Exact width locking ensures perfect math.
  const BUTTONS_WIDTH = 100; // Plus button + Dropdown trigger space
  const maxVisible = Math.max(1, Math.floor((containerWidth - BUTTONS_WIDTH) / TAB_WIDTH));

  let visibleTabs = store.openTabs;
  let hiddenTabs = [];

  if (store.openTabs.length > maxVisible) {
    const activeIndex = store.openTabs.indexOf(activeId);

    // If the active tab gets pushed to the hidden area, swap it into the visible array
    if (activeIndex !== -1 && activeIndex >= maxVisible) {
      visibleTabs = store.openTabs.slice(0, maxVisible);
      visibleTabs[maxVisible - 1] = store.openTabs[activeIndex]; // Overwrite the last slot
      hiddenTabs = store.openTabs.filter(id => !visibleTabs.includes(id));
    } else {
      visibleTabs = store.openTabs.slice(0, maxVisible);
      hiddenTabs = store.openTabs.slice(maxVisible);
    }
  }

  // --- CONTENT RENDERER ---
  const renderContent = () => {
    if (!activeId) return <div className="flex-1 flex items-center justify-center text-text-secondary">No tabs open</div>;
    if (store.monitorStates[activeId]) return <DashboardPanel />;
    if (store.getEnvironmentById(activeId)) return <EnvironmentTab envId={activeId} />;

    const req = store.requestStates[activeId];
    if (req) {
      switch (req.protocol || 'http') {
        case 'http': case 'https': return <HttpRequestPanel activeId={activeId} />;
        case 'graphql': return <GraphqlRequestPanel activeId={activeId} />;
        case 'grpc': return <GrpcRequestPanel activeId={activeId} />;
        case 'websocket': return <WebSocketRequestPanel activeId={activeId} />;
        default: return <HttpRequestPanel activeId={activeId} />;
      }
    }
    return <div className="flex-1 flex items-center justify-center text-text-secondary">Unknown Tab Type</div>;
  };

  return (
    <main className="flex-1 glass border-l border-white/5 flex flex-col min-w-0 h-full relative z-0 overflow-hidden">
      <div className="absolute inset-0 bg-white/[0.01] pointer-events-none" />

      {/* --- UNIFIED MULTI-TAB BAR --- */}
      <div
        ref={containerRef}
        className="flex items-center border-b border-white/5 bg-white/[0.02] shrink-0 pt-2 w-full relative z-[9999] px-2"
      >
        {visibleTabs.map(tabId => {
          const { name, icon, isPreview, isDirty, isActive } = getTabInfo(tabId);

          return (
            <div
              key={tabId}
              onClick={() => store.openTab(tabId)}
              onDoubleClick={() => store.markTabPermanent(tabId)}
              className={`
                group flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold 
                cursor-pointer w-44 shrink-0 relative select-none transition-all duration-300 rounded-t-xl
                ${isActive
                  ? 'bg-white/5 text-white shadow-[0_-4px_12px_rgba(157,90,229,0.1)]'
                  : 'text-text-muted hover:text-white hover:bg-white/[0.02]'}
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute top-0 left-0 right-0 h-[2px] bg-brand-primary shadow-glow"
                />
              )}

              <div className="shrink-0 scale-110">{icon}</div>
              <span className={`truncate flex-1 tracking-wide ${isPreview ? 'italic font-medium opacity-60' : ''}`}>{name.toUpperCase()}</span>

              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {isDirty && <div className="w-1.5 h-1.5 rounded-full bg-brand-primary group-hover:hidden shadow-glow"></div>}
                <X
                  size={14}
                  className={`text-text-muted hover:text-white hover:bg-white/10 rounded-md p-0.5 transition-all ${isDirty ? 'hidden group-hover:block' : 'opacity-0 group-hover:opacity-100'}`}
                  onClick={(e) => handleTabClose(e, tabId)}
                />
              </div>
            </div>
          );
        })}

        {/* --- OVERFLOW DROPDOWN --- */}
        {hiddenTabs.length > 0 && (
          <div className="relative flex items-center shrink-0 h-full ml-1" ref={dropdownRef}>
            <div
              className={`px-4 py-2.5 text-[11px] font-black cursor-pointer flex items-center gap-2 transition-all h-full rounded-t-xl ${showDropdown ? 'bg-white/5 text-white' : 'text-text-muted hover:text-white hover:bg-white/[0.02]'}`}
              onClick={() => setShowDropdown(!showDropdown)}
              title="View hidden tabs"
            >
              <ChevronsRight size={14} className="text-brand-primary" />
              <span>{hiddenTabs.length} HIDDEN</span>
            </div>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-[100%] right-0 mt-1 w-72 glass-strong border border-white/10 rounded-2xl shadow-2xl py-2 z-[10000] max-h-96 overflow-y-auto custom-scrollbar p-1"
                >
                  {hiddenTabs.map(tabId => {
                    const { name, icon, isDirty, isPreview } = getTabInfo(tabId);
                    return (
                      <div
                        key={tabId}
                        onClick={() => { store.openTab(tabId); setShowDropdown(false); }}
                        className="group flex items-center justify-between px-4 py-3 text-[11px] font-bold text-text-muted hover:bg-white/5 hover:text-white cursor-pointer rounded-xl transition-all"
                      >
                        <div className="flex items-center gap-3 overflow-hidden flex-1 mr-2">
                          <div className="shrink-0">{icon}</div>
                          <span className={`truncate tracking-wide ${isPreview ? 'italic font-medium' : ''}`}>{name.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isDirty && <div className="w-1.5 h-1.5 rounded-full bg-brand-primary group-hover:shadow-glow font-black"></div>}
                          <X
                            size={14}
                            className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                            onClick={(e) => handleTabClose(e, tabId)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Plus Button - Detached Request */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="ml-2 px-3 py-2 text-text-muted hover:text-brand-primary cursor-pointer shrink-0 flex items-center h-full transition-colors"
          onClick={() => store.createDetachedRequest('http')}
          title="Create Ad-Hoc Request"
        >
          <Plus size={18} strokeWidth={2.5} />
        </motion.div>
      </div>

      {/* --- VIEWPORT --- */}
      {renderContent()}

      {/* --- CONFIRMATION MODAL --- */}
      <UnsavedChangesModal
        isOpen={!!closeCandidateId}
        itemName={getCandidateName()}
        onClose={() => setCloseCandidateId(null)}
        onDiscard={handleDiscard}
        onSave={handleSaveAndClose}
      />

    </main>
  );
}