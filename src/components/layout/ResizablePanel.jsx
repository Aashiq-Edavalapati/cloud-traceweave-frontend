'use client';
import { useState, useRef, useEffect } from 'react';
import { Search, Plus, FolderPlus, Activity, Sparkles, X, Globe, ChevronsRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

// Keep your existing relative imports logic
import SidebarCollections from '../collections/SidebarCollections';
import SidebarEnvironments from '../environments/SidebarEnvironments';
import SidebarHistory from '../history/SidebarHistory';
import SidebarMonitors from '../monitors/SidebarMonitors';
import NewArtifactModal from './NewArtifactModal';

export default function ResizablePanel() {
  const store = useAppStore();
  const [isResizing, setIsResizing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Resize Logic (Preserved)
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

  // Dynamic Content Switcher (Preserved)
  const renderContent = () => {
    switch (store.activeSidebarItem) {
      case 'Collections': return <SidebarCollections />;
      case 'Environments': return <SidebarEnvironments />;
      case 'History': return <SidebarHistory />;
      case 'Monitor': return <SidebarMonitors />;
      default: return <div className="p-4 text-xs text-text-secondary">Coming Soon</div>;
    }
  };

  // Context Specific Actions (Preserved Logic)
  const getHeaderAction = () => {
    if (store.activeSidebarItem === 'Collections') {
      return (
        <div
          onClick={(e) => {
            e.stopPropagation(); // Prevent bubbling
            store.createCollection();
          }}
          className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-input rounded cursor-pointer transition-colors"
          title="Quick Create Collection"
        >
          <FolderPlus size={16} />
        </div>
      );
    }
    if (store.activeSidebarItem === 'Monitor') {
      return (
        <div
          onClick={(e) => {
            e.stopPropagation();
            store.createMonitor();
          }}
          className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-input rounded cursor-pointer transition-colors"
          title="Quick Create Monitor"
        >
          <Activity size={16} />
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div style={{ width: store.sidebarWidth }} className="glass flex flex-col shrink-0 relative group z-10 h-full border-r border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/[0.01] pointer-events-none" />

        {/* Header Region */}
        <div className="p-4 flex items-center gap-3 border-b border-white/5 shrink-0 relative z-10">

          {/* Search Bar - Refined */}
          <div className="flex-1 flex items-center bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs focus-within:border-brand-primary/50 focus-within:bg-white/10 transition-all group/search">
            <Search size={14} className="text-text-muted group-focus-within/search:text-brand-primary transition-colors mr-2" />
            <input
              type="text"
              placeholder="Filter..."
              className="bg-transparent focus:outline-none w-full placeholder:text-text-muted/50 text-white font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Context Action */}
            {getHeaderAction() && (
              <div className="hover:scale-110 active:scale-95 transition-transform">
                {getHeaderAction()}
              </div>
            )}

            {/* The "New" Button - Premiumized */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsModalOpen(true)}
              className="w-8 h-8 bg-brand-primary text-brand-surface hover:bg-brand-glow rounded-lg transition-all flex items-center justify-center shadow-glow-sm"
              title="Create New..."
            >
              <Plus size={18} strokeWidth={3} />
            </motion.button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10">
          <div className="p-1">
            {renderContent()}
          </div>
        </div>

        {/* Resize Handle - More Subtle & Premium */}
        <div
          onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
          className={`absolute right-0 top-0 bottom-0 w-[2px] transition-all duration-300 z-40 
            ${isResizing ? 'bg-brand-primary shadow-glow' : 'bg-transparent group-hover:bg-white/10'}
            cursor-col-resize hover:w-[4px]`}
        />
      </div>

      {/* Modal Injection */}
      <NewArtifactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
