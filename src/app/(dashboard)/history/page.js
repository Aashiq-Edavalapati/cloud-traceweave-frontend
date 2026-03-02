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

// Helpers for UI
const getStatusColor = (code) => {
  if (!code) return 'text-text-muted bg-gray-500/10 border-gray-500/20';
  if (code >= 200 && code < 300) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  if (code >= 300 && code < 400) return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
  if (code >= 400 && code < 500) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  return 'text-red-500 bg-red-500/10 border-red-500/20';
};

const getMethodColor = (method) => {
  const colors = { 
    GET: 'text-emerald-500', 
    POST: 'text-brand-orange', 
    PUT: 'text-blue-500', 
    DELETE: 'text-red-500' 
  };
  return colors[method] || 'text-text-secondary';
};

export default function HistoryPage() {
  const router = useRouter();
  const { historyLogs, historyPagination, isHistoryLoading, fetchHistory } = useAppStore();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchHistory(currentPage, 20);
  }, [currentPage]);

  const handleRowClick = (execId) => {
    router.push(`/history/${execId}`);
  };

  const handleBackHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col p-8 max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Activity size={28} className="text-brand-orange" />
            Execution History
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Review your recent API calls, latencies, and error rates across all workspaces.
          </p>
        </div>

        {/* Back to Home Button */}
        <button
          onClick={handleBackHome}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border-subtle rounded-lg hover:bg-bg-input transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>
      </div>

      {/* Datagrid */}
      <div className="bg-bg-panel border border-border-subtle rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-bg-base/50 text-text-muted border-b border-border-subtle uppercase tracking-wider text-[11px] font-semibold">
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
                Array.from({ length: 8 }).map((_, i) => (
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
                  <td colSpan="5" className="px-6 py-12 text-center text-text-muted">
                    No execution history found. Run some requests to see them here!
                  </td>
                </tr>
              ) : (
                historyLogs.map((log) => {
                  const urlObj = new URL(log.url);
                  return (
                    <tr 
                      key={log._id}
                      onClick={() => handleRowClick(log._id)}
                      className="hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center justify-center px-2 py-1 rounded border text-xs font-bold ${getStatusColor(log.status)}`}>
                          {log.status || 'ERR'} {log.statusText ? `- ${log.statusText}` : ''}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className={`font-bold ${getMethodColor(log.method)}`}>
                            {log.method}
                          </span>
                          <span className="text-text-primary group-hover:text-brand-orange transition-colors truncate max-w-[300px] lg:max-w-md" title={log.url}>
                            <span className="text-text-muted">{urlObj.origin}</span>
                            {urlObj.pathname}
                            {urlObj.search}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-text-secondary">
                        {log.timings?.total ? `${log.timings.total}ms` : 'N/A'}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-text-secondary">
                        {log.responseSize ? `${(log.responseSize / 1024).toFixed(1)} KB` : '0 KB'}
                      </td>
                      <td className="px-6 py-3.5 text-text-secondary flex items-center gap-2">
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

        {/* Pagination Footer */}
        {!isHistoryLoading && historyPagination.pages > 1 && (
          <div className="border-t border-border-subtle bg-bg-base/30 p-4 flex items-center justify-between text-sm text-text-secondary">
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
    </div>
  );
}