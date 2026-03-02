'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { format, isValid } from 'date-fns';
import { Search, Trash2, CheckCircle2, AlertCircle, Clock, Trash, Loader2, Globe, FolderSync } from 'lucide-react';

export default function SidebarHistory() {
  const historyList = useAppStore(state => state.historyLogs);
  const fetchHistory = useAppStore(state => state.fetchHistory);
  const clearHistory = useAppStore(state => state.clearHistory);
  const removeFromHistory = useAppStore(state => state.removeFromHistory);

  const [filterText, setFilterText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [scope, setScope] = useState('workspace');

  useEffect(() => {
    fetchHistory(scope, 1, 40);
  }, [scope, fetchHistory]);

  const groupedHistory = useMemo(() => {
    if (!historyList) return {};
    const filtered = historyList.filter(item => {
      const matchesText = (item?.url || '').toLowerCase().includes(filterText.toLowerCase()) ||
                         (item?.method?.toLowerCase().includes(filterText.toLowerCase()));
      if (filterType === 'success') return matchesText && item.status >= 200 && item.status < 300;
      if (filterType === 'error') return matchesText && item.status >= 400;
      return matchesText;
    });

    return filtered.reduce((groups, item) => {
      const date = new Date(item.createdAt);
      const label = isValid(date) ? format(date, 'MMM d, yyyy') : 'Unknown';
      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
      return groups;
    }, {});
  }, [historyList, filterText, filterType]);

  return (
    /**
     * LAYER 1: THE SHELL
     * We use h-screen (or h-full if parent is h-screen) and overflow-hidden.
     * This is the "Anchor". It never moves.
     */
    <div className="flex flex-col h-screen w-full bg-transparent overflow-hidden border-r border-white/5">
      
      {/* LAYER 2: THE FIXED HEADER
          flex-none ensures this div never shrinks or grows.
          It is physically outside the scrollable div below.
      */}
      <div className="flex-none p-4 space-y-4 bg-transparent z-50">
        {/* Scope Tabs */}
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setScope('workspace')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-bold transition-all ${scope === 'workspace' ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white/50'}`}
          >
            <FolderSync size={14} /> Workspace
          </button>
          <button
            onClick={() => setScope('all')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-bold transition-all ${scope === 'all' ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white/50'}`}
          >
            <Globe size={14} /> Global
          </button>
        </div>

        {/* Search & Filter Row */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-3 text-white/20" />
            <input
              type="text"
              placeholder="Search logs..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full bg-white/[0.03] pl-10 pr-4 py-2.5 text-xs rounded-xl border border-white/5 focus:border-white/20 outline-none transition-all"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex gap-1 bg-white/[0.02] p-1 rounded-lg border border-white/5">
              {['all', 'success', 'error'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${filterType === t ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}
                >
                  {t === 'all' ? 'ALL' : t === 'success' ? '2XX' : '4XX+'}
                </button>
              ))}
            </div>
            <button onClick={() => clearHistory?.()} className="p-2 text-white/10 hover:text-rose-500 transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* LAYER 3: THE SCROLL VAULT
          flex-1 tells this div to take up all remaining space.
          overflow-y-auto enables scrolling ONLY within this box.
      */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="px-4 pb-10">
          {Object.entries(groupedHistory).map(([date, items]) => (
            <div key={date} className="relative mb-2">
              
              {/* DYNAMIC STICKY DATE
                  - top-0: Sticks to the top of Layer 3.
                  - z-40: Stays above the logs.
                  - bg-black/80 + blur: Ensures logs aren't visible behind the text.
              */}
              <div className="sticky top-0 z-40 py-4 bg-[#0d0d0d]/90 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                    {date}
                  </span>
                  <div className="h-px bg-white/5 flex-1" />
                </div>
              </div>

              {/* Log Items */}
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item._id || item.id}
                    className="group relative p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/20 hover:bg-white/[0.05] transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/5">
                        {item.method}
                      </span>
                      <span className="text-[10px] text-white/20 font-mono">
                        {format(new Date(item.createdAt), 'HH:mm')}
                      </span>
                    </div>
                    <div className="text-[11px] text-white/80 font-mono truncate mb-2">
                      {item.url}
                    </div>
                    <div className={`text-[10px] font-bold ${item.status < 400 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.status || 'ERROR'} <span className="text-white/10 font-normal ml-2">— {item.timings?.total}ms</span>
                    </div>
                    
                    {/* Delete button on hover */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFromHistory?.(item._id || item.id); }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-rose-500/10 text-rose-500 rounded-md transition-all"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}