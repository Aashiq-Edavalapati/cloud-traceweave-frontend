'use client';
import { useState, useEffect } from 'react';
import { Search, Plus, FolderPlus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import SidebarCollections from '../collections/SidebarCollections';
import SidebarEnvironments from '../environments/SidebarEnvironments';
import SidebarHistory from '../history/SidebarHistory';

export default function ResizablePanel() {
  const store = useAppStore();
  const [isResizing, setIsResizing] = useState(false);
  
  // Resize Logic
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = Math.max(200, Math.min(500, e.clientX - 70));
      store.setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, store]);

  // Dynamic Content Switcher
  const renderContent = () => {
      switch(store.activeSidebarItem) {
          case 'Collections': return <SidebarCollections />;
          case 'Environments': return <SidebarEnvironments />;
          case 'History': return <SidebarHistory />;
          default: return <div className="p-4 text-xs text-text-secondary">Coming Soon</div>;
      }
  };

  const getHeaderAction = () => {
      if (store.activeSidebarItem === 'Collections') {
          return (
            <div 
              onClick={() => store.createCollection()} 
              className="p-1 text-text-secondary hover:text-text-primary hover:bg-bg-input rounded cursor-pointer" 
              title="New Collection"
            >
              <FolderPlus size={16} />
            </div>
          );
      }
      return null;
  };

  return (
    <div style={{ width: store.sidebarWidth }} className="bg-bg-base border-r border-border-subtle flex flex-col shrink-0 relative group z-10">
      {/* Header */}
      <div className="p-2 flex items-center gap-2 border-b border-border-subtle">
        <div className="flex-1 flex items-center bg-bg-input rounded px-2 py-1 text-xs">
           <Search size={12} className="text-text-secondary mr-2" />
           <input type="text" placeholder="Filter" className="bg-transparent focus:outline-none w-full placeholder:text-text-muted" />
        </div>
        {getHeaderAction()}
      </div>
      
      {/* Dynamic Tree/List */}
      {renderContent()}

      {/* Resize Handle */}
      <div 
        onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
        className="absolute right-0 top-0 bottom-0 w-[4px] cursor-col-resize hover:bg-brand-blue z-40 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  );
}