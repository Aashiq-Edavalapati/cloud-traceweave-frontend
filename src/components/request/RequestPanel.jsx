'use client';
import { useState, useRef, useEffect } from 'react';
import { Plus, X, Globe, Activity, ChevronsRight } from 'lucide-react';
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
    
    let name = 'Unknown';
    let icon = <Globe size={10} />;
    
    if (req) {
      name = req.name;
      icon = (
        <span className={`font-bold text-[10px] ${req.config.method === 'GET' ? 'text-method-get' : 'text-brand-orange'}`}>
          {req.config.method}
        </span>
      );
    } else if (env) {
      name = env.name;
      icon = <Globe size={10} className="text-brand-orange" />;
    } else if (monitor) {
      name = monitor.name;
      icon = <Activity size={10} className="text-brand-orange" />;
    }

    return {
      name,
      icon,
      isPreview: store.previewTabId === tabId,
      isDirty: store.unsavedRequests.has(tabId),
      isActive: tabId === activeId
    };
  };

  // --- 2. ✨ THE FIX: Mathematical calculation for visible tabs ---
  const TAB_WIDTH = 144; // w-36 = 144px. Exact width locking ensures perfect math.
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
    <main className="flex-1 bg-bg-base flex flex-col min-w-0 h-full relative z-0">
      
      {/* --- UNIFIED MULTI-TAB BAR --- */}
      <div 
        ref={containerRef} 
        className="flex items-center border-b border-border-subtle bg-bg-base shrink-0 pt-1 w-full relative z-[9999]"
      >
        {visibleTabs.map(tabId => {
          const { name, icon, isPreview, isDirty, isActive } = getTabInfo(tabId);

          return (
            <div
              key={tabId}
              onClick={() => store.openTab(tabId)}
              onDoubleClick={() => store.markTabPermanent(tabId)}
              // ✨ THE FIX: Added 'w-36 shrink-0' to lock the width for the math calculation
              // ✨ THE FIX: Added 'border-t-transparent' to inactive tabs to stop vertical text jumping
              className={`
                group flex items-center gap-2 px-3 py-2 text-xs border-r border-border-subtle 
                cursor-pointer w-36 shrink-0 relative select-none transition-colors
                ${isActive ? 'bg-bg-panel border-t-2 border-t-brand-orange text-text-primary' : 'text-text-secondary hover:bg-bg-panel border-t-2 border-t-transparent'}
              `}
            >
              <div className="shrink-0">{icon}</div>
              <span className={`truncate flex-1 ${isPreview ? 'italic' : ''}`}>{name}</span>
              
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                {isDirty && <div className="w-1.5 h-1.5 rounded-full bg-brand-orange group-hover:hidden"></div>}
                <X 
                  size={14} 
                  className={`text-text-secondary hover:text-text-primary ${isDirty ? 'hidden group-hover:block' : 'opacity-0 group-hover:opacity-100'}`} 
                  onClick={(e) => handleTabClose(e, tabId)} 
                />
              </div>
            </div>
          );
        })}

        {/* --- OVERFLOW DROPDOWN --- */}
        {hiddenTabs.length > 0 && (
          <div className="relative flex items-center shrink-0 border-r border-border-subtle h-full" ref={dropdownRef}>
            <div 
              className={`px-3 py-2 text-xs font-semibold cursor-pointer flex items-center gap-1 transition-colors h-full border-t-2 ${showDropdown ? 'bg-bg-panel text-text-primary border-t-brand-orange' : 'text-text-secondary hover:text-text-primary hover:bg-bg-panel border-t-transparent'}`}
              onClick={() => setShowDropdown(!showDropdown)}
              title="View hidden tabs"
            >
              <ChevronsRight size={14} className="text-brand-orange" />
              <span>{hiddenTabs.length}</span>
            </div>
            
            {showDropdown && (
              // ✨ THE FIX: absolute positioning works now because overflow-hidden is gone from the parent
              <div className="absolute top-[100%] right-0 mt-[1px] w-64 bg-bg-panel border border-border-strong rounded-b shadow-2xl py-1 z-[9999] max-h-96 overflow-y-auto custom-scrollbar">
                {hiddenTabs.map(tabId => {
                  const { name, icon, isDirty, isPreview } = getTabInfo(tabId);
                  return (
                    <div 
                      key={tabId}
                      // When a hidden tab is clicked, it becomes active and the math instantly pulls it into the visible bar!
                      onClick={() => { store.openTab(tabId); setShowDropdown(false); }}
                      className="group flex items-center justify-between px-3 py-2 text-xs text-text-secondary hover:bg-brand-blue hover:text-white cursor-pointer"
                    >
                      <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
                        <div className="shrink-0">{icon}</div>
                        <span className={`truncate ${isPreview ? 'italic' : ''}`}>{name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isDirty && <div className="w-1.5 h-1.5 rounded-full bg-brand-orange group-hover:bg-white"></div>}
                        <X 
                          size={14} 
                          className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity" 
                          onClick={(e) => {
                            handleTabClose(e, tabId);
                          }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Plus Button - Detached Request */}
        <div
          className="px-3 py-2 text-text-secondary hover:text-text-primary cursor-pointer shrink-0 border-t-2 border-t-transparent flex items-center h-full"
          onClick={() => store.createDetachedRequest('http')}
          title="Create Ad-Hoc Request"
        >
          <Plus size={16} />
        </div>
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