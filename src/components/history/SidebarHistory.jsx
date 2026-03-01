'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { format, isValid } from 'date-fns';
import { Search, Trash2, CheckCircle2, AlertCircle, Clock, Trash, Loader2, Globe, FolderSync } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SidebarHistory() {
  const historyList = useAppStore(state => state.history);
  const fetchHistory = useAppStore(state => state.fetchHistory);
  const clearHistory = useAppStore(state => state.clearHistory);
  const removeFromHistory = useAppStore(state => state.removeFromHistory);
  
  const [filterText, setFilterText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [scope, setScope] = useState('workspace');
  
  // Pagination & Loading State
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Initial Load & Scope Change
  useEffect(() => {
    const loadInitialHistory = async () => {
      setIsLoading(true);
      setPage(1);
      // Now actually passes the scope to the store
      const pagination = await fetchHistory(scope, 1);
      if (pagination) {
        setHasMore(pagination.page < pagination.pages);
      }
      setIsLoading(false);
    };
    
    loadInitialHistory();
  }, [scope, fetchHistory]);

  // Load More Handler
  const handleLoadMore = async () => {
    if (isFetchingMore || !hasMore) return;
    
    setIsFetchingMore(true);
    const nextPage = page + 1;
    const pagination = await fetchHistory(scope, nextPage);
    
    if (pagination) {
      setPage(nextPage);
      setHasMore(pagination.page < pagination.pages);
    }
    setIsFetchingMore(false);
  };

  const groupedHistory = useMemo(() => {
    if (!historyList || !Array.isArray(historyList)) return {};

    const sorted = [...historyList].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
    });

    const filtered = sorted.filter(item => {
      const matchesText =
        (item?.url || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (item?.method && item?.method?.toLowerCase().includes(filterText.toLowerCase()));

      if (filterType === 'success') return matchesText && item.status >= 200 && item.status < 300;
      if (filterType === 'error') return matchesText && item.status >= 400;

      return matchesText;
    });

    return filtered.reduce((groups, item) => {
      const dateStr = item.createdAt; 
      let dateLabel = 'Unknown Date';
      
      if (dateStr) {
          const date = new Date(dateStr);
          if (isValid(date)) {
              const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);

              if (date.toDateString() === today.toDateString()) {
                  dateLabel = 'Today';
              } else if (date.toDateString() === yesterday.toDateString()) {
                  dateLabel = 'Yesterday';
              } else {
                  dateLabel = format(date, 'MMM d, yyyy');
              }
          }
      }

      if (!groups[dateLabel]) groups[dateLabel] = [];
      groups[dateLabel].push(item);
      return groups;
    }, {});
  }, [historyList, filterText, filterType]);

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'POST': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'PUT': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'DELETE': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'PATCH': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'text-gray-500';
    if (status >= 200 && status < 300) return 'text-emerald-500';
    if (status >= 400) return 'text-rose-500';
    return 'text-amber-500';
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A]">
      {/* Search and Filter Header */}
      <div className="p-3 border-b border-[#1A1A1A] sticky top-0 bg-[#0A0A0A] z-20 shadow-md">
        
        {/* Scope Switcher */}
        <div className="flex bg-[#111] p-1 rounded-lg mb-3 border border-[#222]">
          <button
            onClick={() => setScope('workspace')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-semibold transition-all ${scope === 'workspace' ? 'bg-[#222] text-[#EDEDED] shadow-sm border border-[#333]' : 'text-[#666] hover:text-[#999] border border-transparent'}`}
          >
            <FolderSync size={12} /> Workspace
          </button>
          <button
            onClick={() => setScope('all')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-semibold transition-all ${scope === 'all' ? 'bg-[#222] text-[#EDEDED] shadow-sm border border-[#333]' : 'text-[#666] hover:text-[#999] border border-transparent'}`}
          >
            <Globe size={12} /> Global
          </button>
        </div>

        <div className="relative mb-3 group">
          <Search size={14} className="absolute left-3 top-2.5 text-[#666] group-focus-within:text-[#FF6C37] transition-colors" />
          <input
            type="text"
            placeholder="Search URLs or methods..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-[#111] pl-9 pr-3 py-2 text-xs rounded-lg border border-[#222] focus:border-[#FF6C37] focus:ring-1 focus:ring-[#FF6C37]/20 transition-all outline-none text-[#EDEDED] placeholder:text-[#555]"
          />
        </div>

        <div className="flex justify-between items-center w-full">
          <div className="flex gap-1.5 bg-[#111] p-0.5 rounded-md border border-[#222]">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded text-[10px] font-bold tracking-wide transition-colors ${filterType === 'all' ? 'bg-[#333] text-[#EDEDED]' : 'text-[#666] hover:text-[#999]'}`}
            >
              ALL
            </button>
            <button
              onClick={() => setFilterType('success')}
              className={`px-3 py-1 rounded text-[10px] font-bold tracking-wide transition-colors ${filterType === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'text-[#666] hover:text-emerald-500/70'}`}
            >
              2XX
            </button>
            <button
              onClick={() => setFilterType('error')}
              className={`px-3 py-1 rounded text-[10px] font-bold tracking-wide transition-colors ${filterType === 'error' ? 'bg-rose-500/10 text-rose-500' : 'text-[#666] hover:text-rose-500/70'}`}
            >
              4XX+
            </button>
          </div>

          <button
            onClick={() => clearHistory && clearHistory()}
            className="p-1.5 text-[#666] hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors border border-transparent hover:border-rose-500/20"
            title="Clear All History"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-[#666] gap-3">
            <Loader2 size={28} className="animate-spin text-[#FF6C37]" />
            <span className="text-xs font-medium tracking-widest uppercase">Syncing Trace Data</span>
          </div>
        ) : Object.entries(groupedHistory).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#555] gap-3 px-6 text-center">
            <div className="p-4 rounded-full bg-[#111] border border-[#222]">
                <Clock size={32} className="opacity-50" />
            </div>
            <span className="text-sm font-bold text-[#EDEDED]">No history found</span>
            <span className="text-[11px] leading-relaxed">
              {filterText || filterType !== 'all' 
                ? "Try adjusting your search or status filters." 
                : "Your request executions will automatically be saved here."}
            </span>
          </div>
        ) : (
          <div className="p-3">
            {Object.entries(groupedHistory).map(([date, items]) => (
              <div key={date} className="mb-6">
                
                {/* Sticky Date Header */}
                <div className="sticky top-0 z-10 bg-[#0A0A0A]/90 backdrop-blur-md pb-2 pt-1 mb-2">
                    <div className="flex items-center gap-3">
                        <div className="text-[10px] font-bold text-[#888] uppercase tracking-[0.2em] whitespace-nowrap">
                            {date}
                        </div>
                        <div className="h-px bg-[#222] flex-1"></div>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  {items.map((item) => (
                    <div
                      key={item._id || item.id}
                      className="group relative flex flex-col p-3 rounded-lg bg-[#111] border border-[#1A1A1A] hover:border-[#333] hover:bg-[#151515] cursor-pointer transition-all duration-200"
                      onClick={() => {
                        console.log('Restore history item:', item);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border tracking-wider ${getMethodColor(item?.method)}`}>
                          {item?.method || 'GET'}
                        </span>
                        
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-[#555] font-mono whitespace-nowrap">
                                {isValid(new Date(item.createdAt)) ? format(new Date(item.createdAt), 'HH:mm:ss') : ''}
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); removeFromHistory && removeFromHistory(item._id || item.id); }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-[#666] hover:text-rose-500 transition-all absolute right-2 top-2.5"
                                title="Delete from history"
                            >
                                <Trash size={12} />
                            </button>
                        </div>
                      </div>

                      <div className="text-[11px] text-[#EDEDED] font-mono truncate mb-2 pr-6" title={item?.url}>
                        {item?.url || 'No URL'}
                      </div>

                      <div className="flex items-center gap-3 mt-auto pt-2 border-t border-[#222]">
                        <span className={`text-[10px] flex items-center gap-1 font-bold ${getStatusColor(item.status)}`}>
                          {item.status < 400 ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                          {item.status || 'ERR'} {item.statusText ? `- ${item.statusText}` : ''}
                        </span>
                        
                        {item.timings?.total && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-[#333]"></span>
                                <span className="text-[10px] text-[#888] font-mono flex items-center gap-1">
                                    <Clock size={10} />
                                    {item.timings.total}ms
                                </span>
                            </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="mt-6 mb-4 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isFetchingMore}
                  className="px-6 py-2 rounded-full text-[11px] font-bold tracking-widest uppercase bg-[#1A1A1A] border border-[#333] text-[#888] hover:text-[#EDEDED] hover:border-[#FF6C37] transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isFetchingMore ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-[#FF6C37]" />
                      Fetching...
                    </>
                  ) : (
                    'Load Older History'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}