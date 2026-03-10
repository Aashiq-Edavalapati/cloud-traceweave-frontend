'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { 
  Clock, 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft 
} from 'lucide-react';

const getStatusColor = (code) => {
  if (!code) return 'text-text-muted bg-gray-500/10 border-gray-500/20';
  if (code === 101) return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
  if (code >= 200 && code < 300) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  if (code >= 300 && code < 400) return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
  if (code >= 400 && code < 500) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  return 'text-red-500 bg-red-500/10 border-red-500/20';
};

const getMethodColor = (method, protocol) => {
  if (protocol === 'ws') return 'text-purple-400';
  const m = method?.toUpperCase() || '';
  if (m === 'GET') return 'text-blue-400';
  if (m === 'POST') return 'text-emerald-400';
  if (m === 'PUT' || m === 'PATCH') return 'text-amber-400';
  if (m === 'DELETE') return 'text-red-400';
  return 'text-brand-orange';
};

export default function HistoryPage() {
  const router = useRouter();
  const { historyLogs, historyPagination, isHistoryLoading, fetchHistory } = useAppStore();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchHistory('all', currentPage, 20);
  }, [currentPage]);

  return (
    // ✨ Full screen height, no outer padding
    <div className="h-screen bg-bg-base text-text-primary flex flex-col w-full overflow-hidden no-scrollbar">
      
      {/* Header - Edge to Edge */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle bg-bg-panel/40 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-input rounded-md transition-colors"
            title="Back to Home"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-px h-6 bg-border-subtle"></div>
          <div>
            <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Activity size={20} className="text-brand-orange" />
              Execution History
            </h1>
          </div>
        </div>
      </div>

      {/* Datagrid Container - Takes remaining height */}
      <div className="flex-1 overflow-auto bg-bg-base no-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-bg-panel/80 text-text-muted sticky top-0 backdrop-blur-md border-b border-border-subtle uppercase tracking-wider text-[11px] font-semibold z-10">
            <tr>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Method & URL</th>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4">Size</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {isHistoryLoading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-6 w-16 bg-bg-input rounded-md"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-64 bg-bg-input rounded-md"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-12 bg-bg-input rounded-md"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-16 bg-bg-input rounded-md"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-24 bg-bg-input rounded-md"></div></td>
                </tr>
              ))
            ) : historyLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center text-text-muted font-mono">
                  No execution history found.
                </td>
              </tr>
            ) : (
              historyLogs.map((log, idx) => {
                const isWs = log.protocol === 'ws';
                return (
                  <tr 
                    key={`${log._id}-${idx}`}
                    onClick={() => router.push(`/history/${log._id}`)}
                    className="hover:bg-bg-panel/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded border text-xs font-bold ${getStatusColor(log.status)}`}>
                        {log.status || 'ERR'} {log.statusText ? `- ${log.statusText}` : ''}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`font-bold w-12 ${getMethodColor(log.method, log.protocol)}`}>
                          {isWs ? 'WS' : log.method}
                        </span>
                        <span className="text-text-primary font-mono text-sm group-hover:text-brand-orange transition-colors truncate max-w-[400px] xl:max-w-2xl" title={log.url}>
                          {log.url}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 font-mono text-text-secondary">
                      {log.timings?.total ? `${log.timings.total}ms` : 'N/A'}
                    </td>
                    <td className="px-6 py-3 font-mono text-text-secondary">
                      {log.responseSize ? `${(log.responseSize / 1024).toFixed(1)} KB` : '0 KB'}
                    </td>
                    <td className="px-6 py-3 text-text-secondary flex items-center gap-2 font-mono text-xs">
                      <Clock size={14} className="text-text-muted" />
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer - Edge to Edge */}
      {!isHistoryLoading && historyPagination.pages > 1 && (
        <div className="border-t border-border-subtle bg-bg-panel/40 p-4 px-6 flex items-center justify-between text-sm text-text-secondary shrink-0">
          <div>
            Showing <span className="font-medium text-text-primary">{(currentPage - 1) * historyPagination.limit + 1}</span> to <span className="font-medium text-text-primary">{Math.min(currentPage * historyPagination.limit, historyPagination.total)}</span> of <span className="font-medium text-text-primary">{historyPagination.total}</span> results
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-border-subtle rounded hover:bg-bg-input disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(historyPagination.pages, p + 1))}
              disabled={currentPage === historyPagination.pages}
              className="p-2 border border-border-subtle rounded hover:bg-bg-input disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}