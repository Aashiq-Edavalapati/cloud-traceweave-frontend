'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Filter, SortDesc, MoreVertical, Edit3, Copy, Trash2 } from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

// 1. ADD THE ACTION PROPS HERE
export const WorkspacesList = ({ 
  workspaces, 
  onEdit, 
  onDuplicate, 
  onDelete 
}) => {
  const router = useRouter();
  const [activeMenuId, setActiveMenuId] = useState(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest('.dropdown-container')) return;
      setActiveMenuId(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // 2. CREATE A BULLETPROOF ACTION HANDLER
  const handleActionClick = (e, action, ws) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation();
    setActiveMenuId(null); // Close the menu
    if (action) action(ws); // Trigger the modal in the parent!
  };

  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Network size={18} className="text-brand-blue" /> Your Workspaces
        </h2>
        <div className="flex gap-2">
          <button className="p-1.5 text-text-muted hover:text-text-primary rounded hover:bg-white/5"><Filter size={14} /></button>
          <button className="p-1.5 text-text-muted hover:text-text-primary rounded hover:bg-white/5"><SortDesc size={14} /></button>
        </div>
      </div>

      <motion.div key={workspaces.length} variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
        {workspaces.map((ws) => {
          const formattedDate = new Date(ws.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const isShared = ws.members?.length > 1;

          return (
            <motion.div variants={itemVariants} key={ws.id}>
              <div 
                onClick={(e) => {
                    if (e.target.closest('button') || e.target.closest('.dropdown-container')) return;
                    router.push(`/workspace/${ws.id}`);
                }} 
                className={`block group cursor-pointer relative ${activeMenuId === ws.id ? 'z-50' : 'z-10'}`}
              >
                <div className="bg-bg-panel border border-border-subtle rounded-lg p-5 hover:border-brand-primary/50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-text-primary group-hover:text-brand-primary transition-colors">{ws.name}</h3>
                      <p className="text-xs text-text-secondary mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        Active • Updated {formattedDate}
                      </p>
                    </div>
                    
                    <div className="relative dropdown-container">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.nativeEvent?.stopImmediatePropagation();
                          setActiveMenuId(prev => prev === ws.id ? null : ws.id);
                        }}
                        className={`p-1 -mr-1 rounded-md transition-all ${activeMenuId === ws.id ? 'bg-white/10 text-white' : 'text-text-muted hover:text-white hover:bg-white/10'}`}
                      >
                        <MoreVertical size={16} />
                      </button>

                      <AnimatePresence>
                        {activeMenuId === ws.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 5 }}
                            className="absolute right-0 top-full mt-2 w-48 glass-strong border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col p-1.5 bg-bg-base"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          >
                            {/* 3. WIRE THE BUTTONS TO THE PROPS */}
                            <button onClick={(e) => handleActionClick(e, onEdit, ws)} className="w-full text-left px-4 py-2 text-[10px] font-black hover:bg-white/5 text-white rounded-xl transition-all flex items-center gap-2.5 uppercase tracking-wider">
                              <Edit3 size={14} className="text-brand-primary" /> Edit Settings
                            </button>
                            <button onClick={(e) => handleActionClick(e, onDuplicate, ws)} className="w-full text-left px-4 py-2 text-[10px] font-black hover:bg-white/5 text-white rounded-xl transition-all flex items-center gap-2.5 uppercase tracking-wider">
                              <Copy size={14} className="text-brand-primary" /> Duplicate
                            </button>
                            <div className="h-px bg-white/5 my-1 mx-2" />
                            <button onClick={(e) => handleActionClick(e, onDelete, ws)} className="w-full text-left px-4 py-2 text-[10px] font-black hover:bg-red-500/10 text-red-400 rounded-xl transition-all flex items-center gap-2.5 uppercase tracking-wider">
                              <Trash2 size={14} /> Terminate
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t border-border-subtle pt-4">
                    <div>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Members</p>
                      <p className="text-sm font-mono">{ws.members?.length || 1}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Collections</p>
                      <p className="text-sm font-mono">{ws._count?.collections || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Type</p>
                      <p className={`text-sm font-mono ${isShared ? 'text-brand-blue' : 'text-text-secondary'}`}>
                        {isShared ? 'Shared' : 'Private'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};