'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { format } from 'date-fns';
import { Search, Trash2, MoreVertical, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function SidebarHistory() {
  const store = useAppStore();
  const [filterText, setFilterText] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'success', 'error'
  const [scope, setScope] = useState('workspace');

  const history = store.getFormattedHistory(scope);

  // Filter history items
  const filteredHistory = history.filter(item => {
    // Text search
    const matchesText =
      item.url.toLowerCase().includes(filterText.toLowerCase()) ||
      (item.method && item.method.toLowerCase().includes(filterText.toLowerCase()));

    // Status filter
    if (filterType === 'success') return matchesText && item.status >= 200 && item.status < 300;
    if (filterType === 'error') return matchesText && item.status >= 400;

    return matchesText;
  });

  // Group by date
  const groupedHistory = filteredHistory.reduce((groups, item) => {
    const date = new Date(item.timestamp);
    const today = new Date();
    let dateLabel = format(date, 'MMM d, yyyy');

    if (date.toDateString() === today.toDateString()) {
      dateLabel = 'Today';
    }

    if (!groups[dateLabel]) groups[dateLabel] = [];
    groups[dateLabel].push(item);
    return groups;
  }, {});

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'POST': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'PUT': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'DELETE': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'text-gray-500';
    if (status >= 200 && status < 300) return 'text-green-500';
    if (status >= 400) return 'text-red-500';
    return 'text-yellow-500';
  };

  return (
    <div className="flex flex-col h-full bg-bg-secondary/30">
      {/* Search and Filter Header */}
      <div className="p-3 border-b border-border-subtle sticky top-0 bg-bg-secondary z-10">
        <div className="relative mb-2">
          <Search size={14} className="absolute left-2.5 top-2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Filter history..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-bg-input pl-8 pr-3 py-1.5 text-xs rounded border border-border-subtle focus:border-brand-orange focus:outline-none text-text-primary placeholder:text-text-tertiary"
          />
        </div>

        <div className="flex justify-between items-center text-xs">
          <div className="flex flex-col gap-2 w-full">
            {/* Scope Toggle */}
            <div className="flex bg-bg-input p-0.5 rounded-md self-start">
              <button
                onClick={() => setScope('workspace')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${scope === 'workspace' ? 'bg-bg-secondary text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'}`}
              >
                Workspace
              </button>
              <button
                onClick={() => setScope('all')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${scope === 'all' ? 'bg-bg-secondary text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'}`}
              >
                Global
              </button>
            </div>

            <div className="flex justify-between items-center w-full">
              <div className="flex gap-1">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2 py-0.5 rounded-full border ${filterType === 'all' ? 'bg-bg-input border-text-secondary text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-secondary'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('success')}
                  className={`px-2 py-0.5 rounded-full border ${filterType === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'border-transparent text-text-tertiary hover:text-text-secondary'}`}
                >
                  Success
                </button>
              </div>

              <button
                onClick={() => store.clearHistory?.()}
                className="text-text-tertiary hover:text-red-400 flex items-center gap-1 transition-colors"
                title="Clear All History"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {Object.entries(groupedHistory).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-text-tertiary">
            <Clock size={32} className="mb-2 opacity-50" />
            <span className="text-xs">No history found</span>
          </div>
        ) : (
          Object.entries(groupedHistory).map(([date, items]) => (
            <div key={date} className="mb-4">
              <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-2 px-1 sticky top-0 bg-bg-secondary/95 backdrop-blur-sm py-1 z-0">
                {date}
              </div>
              <div className="grid gap-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="group relative flex flex-col p-2 rounded hover:bg-bg-input cursor-pointer border border-transparent hover:border-border-subtle transition-all"
                    onClick={() => {
                      // Restore Logic
                      console.log('Restore history item:', item);
                    }}
                  >
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getMethodColor(item.method)}`}>
                          {item.method || 'GET'}
                        </span>
                        <span className="text-xs text-text-secondary truncate font-mono" title={item.url}>
                          {item.url?.replace(/^https?:\/\//, '') || 'No URL'}
                        </span>
                      </div>
                      <span className="text-[10px] text-text-tertiary whitespace-nowrap">
                        {format(new Date(item.timestamp), 'h:mm a')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] flex items-center gap-1 font-medium ${getStatusColor(item.status)}`}>
                        {item.status < 400 ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                        {item.status || 'Error'} <span className="text-text-tertiary font-normal">in {item.duration}ms</span>
                      </span>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); store.removeFromHistory?.(item.id); }}
                          className="p-1 hover:bg-bg-secondary rounded text-text-tertiary hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

      </div>
    </div>
  );
}