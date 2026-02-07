'use client';
import { Plus, X, Globe, Activity } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import EnvironmentTab from './EnvironmentTab';
import DashboardPanel from '../dashboard/DashboardPanel';
import HttpRequestPanel from './request_panel/HttpRequestPanel'; 
import GraphqlRequestPanel from './request_panel/GraphqlRequestPanel';
import GrpcRequestPanel from './request_panel/GrpcRequestPanel';
import WebSocketRequestPanel from './request_panel/WebSocketRequestPanel';

export default function RequestPanel() {
  const store = useAppStore();
  const activeId = store.activeTabId;
  
  // Logic to determine what content to render
  const renderContent = () => {
    if (!activeId) {
      return <div className="flex-1 flex items-center justify-center text-text-secondary">No tabs open</div>;
    }

    // 1. Check for Monitor
    if (store.monitorStates[activeId]) {
      return <DashboardPanel />;
    }

    // 2. Check for Environment
    const env = store.getEnvironmentById(activeId);
    if (env) {
      return <EnvironmentTab envId={activeId} />;
    }

    // 3. Check for Request
    const req = store.requestStates[activeId];
    if (req) {
      // Default to 'http' if protocol is undefined (backward compatibility)
      const protocol = req.protocol || 'http'; 
      
      switch (protocol) {
        case 'http':
        case 'https': 
          return <HttpRequestPanel activeId={activeId} />;
        case 'graphql':
          return <GraphqlRequestPanel activeId={activeId} />;
        case 'grpc':
          return <GrpcRequestPanel activeId={activeId} />;
        case 'websocket':
          return <WebSocketRequestPanel activeId={activeId} />;
        default:
          return <HttpRequestPanel activeId={activeId} />;
      }
    }

    return <div className="flex-1 flex items-center justify-center text-text-secondary">Unknown Tab Type</div>;
  };

  return (
    <main className="flex-1 bg-bg-base flex flex-col min-w-0 h-full relative z-0">
      
      {/* --- UNIFIED MULTI-TAB BAR --- */}
      {/* This logic was previously duplicated 3 times. Now it lives once here. */}
      <div className="flex items-center border-b border-border-subtle bg-bg-base overflow-x-auto no-scrollbar shrink-0 pt-1">
        {store.openTabs.map(tabId => {
          const req = store.requestStates[tabId];
          const env = store.getEnvironmentById(tabId);
          const monitor = store.monitorStates[tabId];
          
          let name = 'Unknown';
          let icon = <Globe size={10} />;
          
          if (req) {
            name = req.name;
            icon = (
              <span className={`font-bold text-[10px] ${req.method === 'GET' ? 'text-method-get' : 'text-brand-orange'}`}>
                {req.method}
              </span>
            );
          } else if (env) {
            name = env.name;
            icon = <Globe size={10} className="text-brand-orange" />;
          } else if (monitor) {
            name = monitor.name;
            icon = <Activity size={10} className="text-brand-orange" />;
          }

          const isPreview = store.previewTabId === tabId;
          const isTabDirty = store.unsavedRequests.has(tabId);
          const isActive = tabId === activeId;

          return (
            <div
              key={tabId}
              onClick={() => store.openTab(tabId)}
              onDoubleClick={() => store.markTabPermanent(tabId)}
              className={`
                group flex items-center gap-2 px-3 py-2 text-xs border-r border-border-subtle 
                cursor-pointer min-w-[120px] max-w-[200px] relative select-none 
                ${isActive ? 'bg-bg-panel border-t-2 border-t-brand-orange text-text-primary' : 'text-text-secondary hover:bg-bg-panel'}
              `}
            >
              {icon}
              <span className={`truncate flex-1 ${isPreview ? 'italic' : ''}`}>{name}</span>
              
              <div className="w-4 h-4 flex items-center justify-center">
                {isTabDirty && <div className="w-1.5 h-1.5 rounded-full bg-brand-orange group-hover:hidden"></div>}
                <X 
                  size={14} 
                  className={`text-text-secondary hover:text-text-primary ${isTabDirty ? 'hidden group-hover:block' : 'opacity-0 group-hover:opacity-100'}`} 
                  onClick={(e) => { e.stopPropagation(); store.closeTab(tabId); }} 
                />
              </div>
            </div>
          );
        })}

        {/* Plus Button - Detached Request */}
        <div
          className="px-3 text-text-secondary hover:text-text-primary cursor-pointer"
          onClick={() => store.createDetachedRequest('http')}
        >
          <Plus size={16} />
        </div>
      </div>

      {/* --- VIEWPORT --- */}
      {renderContent()}
      
    </main>
  );
}