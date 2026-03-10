'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { GitMerge, Plus, Search, Play, Clock, MoreVertical, Star, CheckCircle2, AlertCircle, Loader2, Trash2, Edit2, Copy, Zap, RefreshCw } from 'lucide-react';
import { useModal } from '@/components/providers/ModalProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTimeAgo } from '@/utils/format';
import LogStreamSidebar from './LogStreamSidebar';

export default function WorkflowList() {
  const router = useRouter();
  const { workspaceId } = useParams();
  const { showAlert, showPrompt, showConfirm } = useModal();

  const {
    workflows, fetchWorkspacesWorkflows, createWorkflow, deleteWorkflow,
    renameWorkflow, toggleWorkflowPin, duplicateWorkflow, executeWorkflow, fetchWorkflowHistory
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); 
  const [showFavorites, setShowFavorites] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [runningId, setRunningId] = useState(null);
  const [sidebarWorkflowId, setSidebarWorkflowId] = useState(null);

  useEffect(() => {
    if (workspaceId) fetchWorkspacesWorkflows(workspaceId);
  }, [workspaceId, fetchWorkspacesWorkflows]);

  // --- Handlers with strict stopPropagation ---
  const handleOpenLogs = (e, id) => {
    e.stopPropagation();
    setSidebarWorkflowId(id);
    fetchWorkflowHistory(id);
  };

  const handleRun = async (e, id) => {
    if (e) e.stopPropagation();
    setRunningId(id);
    try { await executeWorkflow(id); } 
    catch (e) { showAlert("Execution failed", "Error"); } 
    finally { setRunningId(null); }
  };

  const handleMenuAction = (e, callback) => {
    e.stopPropagation();
    setMenuOpenId(null);
    callback();
  };

  const filteredWorkflows = workflows.filter((wf) => {
    const matchesSearch = wf.name.toLowerCase().includes(searchQuery.toLowerCase());
    const lastStatus = wf.executions?.[0]?.status || 'IDLE';
    const matchesStatus = statusFilter === 'ALL' || lastStatus === statusFilter;
    const matchesFav = !showFavorites || wf.pinned; 
    return matchesSearch && matchesStatus && matchesFav;
  });

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-bg-base text-text-primary flex flex-col p-8 w-full relative z-10">
      {/* Header & Filter */}
      <div className="flex flex-col gap-8 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3 italic uppercase">
              <GitMerge size={32} className="text-brand-primary" /> Visual Workflows
            </h1>
            <p className="text-text-muted text-sm mt-2 font-medium">Manage and automate your API sequences.</p>
          </div>
          <button onClick={() => showPrompt("New Workflow", n => createWorkflow(workspaceId, n), "My Workflow")} className="flex items-center gap-2 bg-brand-primary hover:bg-brand-glow text-brand-surface px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all hover-glow shadow-glow-sm">
            <Plus size={16} strokeWidth={3} /> New Workflow
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white/[0.02] border border-white/5 p-2 rounded-2xl">
          <div className="relative flex-1 min-w-[200px] group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary" size={14} />
            <input type="text" placeholder="Quick search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent py-2 pl-9 pr-4 text-xs focus:outline-none" />
          </div>
          <div className="flex items-center gap-1.5">
            {['ALL', 'SUCCESS', 'FAILED'].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all border ${statusFilter === s ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' : 'bg-transparent border-transparent text-text-muted'}`}>{s}</button>
            ))}
            <button onClick={() => setShowFavorites(!showFavorites)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all border ${showFavorites ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-transparent border-transparent text-text-muted'}`}>
              <Star size={12} fill={showFavorites ? "currentColor" : "none"} /> FAVORITES
            </button>
          </div>
        </div>
      </div>      

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredWorkflows.map((wf) => {
            const lastExec = wf.executions?.[0];
            const status = lastExec?.status || 'IDLE';

            return (
              <motion.div
                key={wf.id} layout
                className="group bg-bg-panel border border-white/5 rounded-2xl p-6 hover:border-brand-primary/30 transition-all flex flex-col relative cursor-pointer"
                onClick={() => router.push(`/workspace/${workspaceId}/workflows/${wf.id}`)}
              >
                {/* Status Glow Bar */}
                <div className={`absolute top-0 left-6 right-6 h-0.5 rounded-b-full ${status === 'SUCCESS' ? 'bg-emerald-500' : status === 'FAILED' ? 'bg-red-500' : 'bg-transparent'}`} />

                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <button onClick={(e) => { e.stopPropagation(); toggleWorkflowPin(wf.id); }}>
                      <Star size={18} className={wf.pinned ? "text-yellow-500 fill-yellow-500" : "text-text-muted hover:text-white"} />
                    </button>
                    <h3 className="font-bold text-xl truncate">{wf.name}</h3>
                  </div>
                  
                  <div className="relative">
                    <button onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === wf.id ? null : wf.id); }} className="text-text-muted hover:text-white p-1">
                      <MoreVertical size={18} />
                    </button>
                    {menuOpenId === wf.id && (
                      <div className="absolute right-0 mt-2 w-44 glass-strong rounded-xl border border-white/10 py-2 z-50 shadow-2xl">
                        <button onClick={(e) => handleMenuAction(e, () => showPrompt("Rename", n => renameWorkflow(wf.id, n), wf.name))} className="w-full flex items-center gap-3 px-4 py-2 text-xs hover:bg-white/5"><Edit2 size={14}/> Rename</button>
                        <button onClick={(e) => handleMenuAction(e, () => duplicateWorkflow(wf.id))} className="w-full flex items-center gap-3 px-4 py-2 text-xs hover:bg-white/5"><Copy size={14}/> Duplicate</button>
                        <div className="h-px bg-white/5 my-1" />
                        <button onClick={(e) => handleMenuAction(e, () => showConfirm("Delete?", () => deleteWorkflow(wf.id)))} className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-400 hover:bg-red-400/10"><Trash2 size={14}/> Delete</button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-text-muted mb-8 flex-1 line-clamp-2">{wf.description}</p>

                <div className="flex items-center justify-between border-t border-white/5 pt-5 relative">
                  <div className="flex flex-col gap-1 cursor-pointer" onClick={(e) => handleOpenLogs(e, wf.id)}>
                    <div className="flex items-center gap-2 text-[10px] text-text-muted font-black uppercase"><Clock size={12}/> <span>{lastExec ? formatTimeAgo(lastExec.startedAt) : 'Never'}</span></div>
                    <div className={`flex items-center gap-1.5 text-[9px] font-bold uppercase ${status === 'SUCCESS' ? 'text-emerald-400' : 'text-red-400'}`}>{status}</div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => handleRun(e, wf.id)} className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-brand-surface transition-all">
                      {runningId === wf.id ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="currentColor" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); router.push(`/workspace/${workspaceId}/workflows/${wf.id}`); }} className="flex items-center gap-2 text-[10px] font-black uppercase bg-brand-primary/10 px-4 py-2 rounded-lg hover:bg-brand-primary border border-brand-primary/20">
                      <Play size={12} fill="currentColor" /> Open Builder
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {sidebarWorkflowId && <LogStreamSidebar workflowId={sidebarWorkflowId} onClose={() => setSidebarWorkflowId(null)} />}
      </AnimatePresence>
      
      {menuOpenId && <div className="fixed inset-0 z-40" onClick={() => setMenuOpenId(null)} />}
    </div>
  );
}