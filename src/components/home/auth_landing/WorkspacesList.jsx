'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Network, Filter, SortDesc, MoreVertical } from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export const WorkspacesList = ({ workspaces }) => {
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
              <Link href={`/workspace/${ws.id}`} className="block group">
                <div className="bg-bg-panel border border-border-subtle rounded-lg p-5 hover:border-brand-primary/50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-text-primary group-hover:text-brand-primary transition-colors">{ws.name}</h3>
                      <p className="text-xs text-text-secondary mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        Active • Updated {formattedDate}
                      </p>
                    </div>
                    <MoreVertical size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* REAL DATA METRICS */}
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
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
