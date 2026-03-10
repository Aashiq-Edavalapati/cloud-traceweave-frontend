'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { X, Terminal, Code, Cpu } from 'lucide-react';

export default function FullLogsView({ execution, onClose }) {
  if (!execution) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/80 backdrop-blur-md"
    >
      <div className="bg-bg-panel border border-white/10 w-full max-w-4xl max-h-[80vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <Terminal size={18} className="text-brand-primary" />
            <h2 className="text-sm font-bold uppercase tracking-widest">Execution Trace</h2>
            <span className="text-[10px] text-text-muted font-mono">{execution.id}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logs Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase">
              <Cpu size={12} /> Step Logs
            </div>
            <div className="bg-black/40 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-emerald-400/90 border border-white/5 h-full min-h-[300px]">
              {execution.executionLogs?.map((log, i) => (
                <div key={i} className="mb-1">
                  <span className="text-white/20 mr-2">[{i+1}]</span> {log}
                </div>
              )) || "No logs available for this run."}
            </div>
          </div>

          {/* Context Data Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase">
              <Code size={12} /> Context Data
            </div>
            <pre className="bg-black/40 rounded-xl p-4 font-mono text-[11px] text-brand-primary/80 border border-white/5 overflow-auto h-full max-h-[500px]">
              {JSON.stringify(execution.contextData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </motion.div>
  );
}