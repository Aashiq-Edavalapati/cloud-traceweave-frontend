'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, ChevronRight, Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatTimeAgo } from '@/utils/format';
import FullLogsView from './FullLogsView';

export default function LogStreamSidebar({ workflowId, onClose }) {
  const { workflowHistory } = useAppStore();
  const [selectedExec, setSelectedExec] = useState(null);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed right-0 top-0 bottom-0 w-96 bg-bg-panel border-l border-white/10 z-[70] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <Activity size={18} className="text-brand-primary" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest">Log Stream</h2>
              <p className="text-[10px] text-text-muted">Execution History</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg"><X size={20}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
          {workflowHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-text-muted italic text-xs font-mono opacity-50 text-center">
              <Clock size={32} className="mb-4 opacity-20" /> No executions recorded yet.
            </div>
          ) : (
            workflowHistory.map((exec) => (
              <div 
                key={exec.id} 
                onClick={() => setSelectedExec(exec)}
                className="group bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:border-brand-primary/20 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                    exec.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>{exec.status}</div>
                  <span className="text-[10px] text-text-muted font-mono">{formatTimeAgo(exec.startedAt)}</span>
                </div>
                <div className="text-[11px] text-text-secondary leading-relaxed font-mono line-clamp-2 opacity-60">
                  {exec.executionLogs?.[0] || 'No log summary.'}
                </div>
                <div className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                   <div className="text-[9px] text-text-muted">Duration: {exec.completedAt ? (new Date(exec.completedAt) - new Date(exec.startedAt)) / 1000 : '?'}s</div>
                   <div className="text-[9px] font-black uppercase text-brand-primary flex items-center gap-1">Details <ChevronRight size={10}/></div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedExec && <FullLogsView execution={selectedExec} onClose={() => setSelectedExec(null)} />}
      </AnimatePresence>
    </>
  );
}